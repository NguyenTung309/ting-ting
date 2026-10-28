#!/usr/bin/env bash
set -Eeuo pipefail

readonly ROOT_DIR=/opt/tinhtinhtingting
readonly DEPLOY_DIR="$ROOT_DIR/deploy"
readonly COMPOSE_FILE="$DEPLOY_DIR/compose.production.yaml"
readonly RUNTIME_ENV="$ROOT_DIR/runtime/20261008-supabase.env"
readonly ACTIVE_SLOT_FILE="$ROOT_DIR/runtime/active-slot"
readonly INITIAL_BACKUP_MARKER="$ROOT_DIR/runtime/initial-db-backup-complete"
readonly NGINX_SITE=/etc/nginx/sites-available/tinhtinhtingting.com
readonly NGINX_UPSTREAM=/etc/nginx/conf.d/tinhtinhtingting-upstream.conf
readonly IMAGE_REPOSITORY=ghcr.io/wuwuyn/tinhtinhtingting

fail() { printf 'deploy: %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail 'must run as root'
[[ $# -eq 1 ]] || fail 'usage: ttt-deploy <40-character-commit-sha>'
[[ $1 =~ ^[0-9a-f]{40}$ ]] || fail 'image tag must be a lowercase 40-character commit SHA'
[[ -r "$COMPOSE_FILE" ]] || fail 'production Compose file is missing'
[[ -r "$RUNTIME_ENV" ]] || fail 'server runtime environment file is missing'
[[ -d "$ROOT_DIR/shared/uploads" && -d "$ROOT_DIR/shared/media" ]] || fail 'shared upload/media directories are missing'

sha=$1
image="$IMAGE_REPOSITORY:$sha"
active_slot=systemd
if [[ -r "$ACTIVE_SLOT_FILE" ]]; then
  active_slot=$(<"$ACTIVE_SLOT_FILE")
fi
case "$active_slot" in
  systemd) candidate_slot=blue; candidate_port=3211; previous_port=3210 ;;
  blue) candidate_slot=green; candidate_port=3213; previous_port=3211 ;;
  green) candidate_slot=blue; candidate_port=3211; previous_port=3213 ;;
  *) fail "unknown active slot '$active_slot'" ;;
esac

current_healthy=false
for attempt in $(seq 1 15); do
  if node -e '
    fetch("https://tinhtinhtingting.com/api/health", { signal: AbortSignal.timeout(5000) })
      .then(async (response) => {
        const body = await response.json();
        const ok = response.ok && body.status === "ok" && body.database === true &&
          body.payload === true && body.storageHealthy === true;
        process.exit(ok ? 0 : 1);
      })
      .catch(() => process.exit(1));
  '; then
    current_healthy=true
    break
  fi
  sleep 2
done
[[ $current_healthy == true ]] || fail 'current production health check is not fully green; no image was started and traffic was not changed'

if [[ $active_slot == systemd && ! -e "$INITIAL_BACKUP_MARKER" ]]; then
  /usr/local/sbin/ttt-backup-db
  printf '%s\n' "$(date -u +%FT%TZ)" > "$INITIAL_BACKUP_MARKER.tmp"
  chmod 600 "$INITIAL_BACKUP_MARKER.tmp"
  mv -f "$INITIAL_BACKUP_MARKER.tmp" "$INITIAL_BACKUP_MARKER"
fi

project="ttt-$candidate_slot"
printf 'deploy: pulling %s into inactive %s slot on loopback port %s\n' "$image" "$candidate_slot" "$candidate_port"
APP_IMAGE="$image" \
APP_HOST_PORT="$candidate_port" \
APP_DATA_ROOT="$ROOT_DIR/shared" \
TTT_RUNTIME_ENV_FILE="$RUNTIME_ENV" \
  docker compose --project-name "$project" -f "$COMPOSE_FILE" pull app
APP_IMAGE="$image" \
APP_HOST_PORT="$candidate_port" \
APP_DATA_ROOT="$ROOT_DIR/shared" \
TTT_RUNTIME_ENV_FILE="$RUNTIME_ENV" \
  docker compose --project-name "$project" -f "$COMPOSE_FILE" up -d --no-deps app

healthy=false
for attempt in $(seq 1 60); do
  if node -e '
    fetch(`http://127.0.0.1:${process.argv[1]}/api/health`, { signal: AbortSignal.timeout(5000) })
      .then(async (response) => {
        const body = await response.json();
        const ok = response.ok && body.status === "ok" && body.database === true &&
          body.payload === true && body.storageHealthy === true;
        process.exit(ok ? 0 : 1);
      })
      .catch(() => process.exit(1));
  ' "$candidate_port"; then
    healthy=true
    break
  fi
  sleep 2
done
[[ $healthy == true ]] || fail "candidate $candidate_slot failed strict application/database/Payload/storage health checks; active traffic was not changed"

[[ -f "$NGINX_SITE" ]] || fail 'Nginx site configuration is missing'
backup="$ROOT_DIR/backups/nginx-site-$(date -u +%Y%m%dT%H%M%SZ).conf"
cp -an "$NGINX_SITE" "$backup"
old_upstream_exists=false
if [[ -e "$NGINX_UPSTREAM" ]]; then
  old_upstream_exists=true
  cp -a "$NGINX_UPSTREAM" "$backup.upstream"
fi

restore_nginx() {
  cp -a "$backup" "$NGINX_SITE"
  if [[ $old_upstream_exists == true ]]; then
    cp -a "$backup.upstream" "$NGINX_UPSTREAM"
  else
    rm -f "$NGINX_UPSTREAM"
  fi
  nginx -t && systemctl reload nginx || true
}

write_upstream() {
  local port=$1 tmp
  tmp=$(mktemp /etc/nginx/conf.d/.tinhtinhtingting-upstream.XXXXXX)
  cat > "$tmp" <<EOF
upstream tinhtinhtingting_backend {
    server 127.0.0.1:$port;
    keepalive 32;
}
EOF
  chmod 644 "$tmp"
  mv -f "$tmp" "$NGINX_UPSTREAM"
}

if ! grep -q 'proxy_pass http://tinhtinhtingting_backend;' "$NGINX_SITE"; then
  python3 - "$NGINX_SITE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()
updated, count = re.subn(
    r'proxy_pass\s+http://127\.0\.0\.1:3210\s*;',
    'proxy_pass http://tinhtinhtingting_backend;',
    text,
    count=1,
)
if count != 1:
    raise SystemExit('expected exactly one existing proxy_pass to 127.0.0.1:3210')
path.write_text(updated)
PY
fi

write_upstream "$candidate_port"
if ! nginx -t || ! systemctl reload nginx; then
  restore_nginx
  fail 'Nginx switch failed; restored the previous upstream configuration'
fi

external_healthy=false
for attempt in $(seq 1 15); do
  if node -e '
    fetch("https://tinhtinhtingting.com/api/health", { signal: AbortSignal.timeout(5000) })
      .then(async (response) => {
        const body = await response.json();
        const ok = response.ok && body.status === "ok" && body.database === true &&
          body.payload === true && body.storageHealthy === true;
        process.exit(ok ? 0 : 1);
      })
      .catch(() => process.exit(1));
  '; then
    external_healthy=true
    break
  fi
  sleep 2
done
if [[ $external_healthy != true ]]; then
  restore_nginx
  fail 'public health check failed after switch; restored the previous upstream'
fi

printf '%s\n' "$candidate_slot" > "$ACTIVE_SLOT_FILE.tmp"
chmod 600 "$ACTIVE_SLOT_FILE.tmp"
mv -f "$ACTIVE_SLOT_FILE.tmp" "$ACTIVE_SLOT_FILE"
printf 'deploy: %s is active; previous slot remains available on port %s\n' "$candidate_slot" "$previous_port"
