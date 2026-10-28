#!/usr/bin/env bash
set -Eeuo pipefail

readonly ROOT_DIR=/opt/tinhtinhtingting
readonly RUNTIME_ENV="$ROOT_DIR/runtime/20261008-supabase.env"

[[ $EUID -eq 0 ]] || { echo 'must run as root' >&2; exit 1; }
[[ -r "$RUNTIME_ENV" ]] || { echo 'server runtime environment file is missing' >&2; exit 1; }

stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_dir="$ROOT_DIR/backups/db-initial-$stamp"
install -d -o root -g root -m 700 "$backup_dir"
cleanup_failed_backup() {
  local status=$?
  if (( status != 0 )); then
    rm -f -- "$backup_dir"/*.dump
    rmdir -- "$backup_dir" 2>/dev/null || true
  fi
  return "$status"
}
trap cleanup_failed_backup EXIT

docker run --rm --network host \
  --env-file "$RUNTIME_ENV" \
  --mount "type=bind,src=$backup_dir,dst=/backup" \
  postgres:17-alpine sh -ec '
    : "${APP_DATABASE_URL:?APP_DATABASE_URL is required}"
    : "${PAYLOAD_DATABASE_URL:?PAYLOAD_DATABASE_URL is required}"
    pg_dump --dbname="$APP_DATABASE_URL" --format=custom --no-owner --no-acl --file=/backup/app-database.dump
    pg_dump --dbname="$PAYLOAD_DATABASE_URL" --format=custom --no-owner --no-acl --file=/backup/payload-database.dump
  '

chmod 600 "$backup_dir"/*.dump
printf 'database backups saved in %s\n' "$backup_dir"
