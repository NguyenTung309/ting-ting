#!/usr/bin/env bash
set -Eeuo pipefail

readonly ROOT_DIR=/opt/tinhtinhtingting
readonly DEPLOY_USER=ttt-deploy
readonly DEPLOY_HOME=/home/ttt-deploy

[[ $EUID -eq 0 ]] || { echo 'must run as root' >&2; exit 1; }
[[ $# -eq 1 ]] || { echo 'usage: bootstrap-production.sh <ssh-ed25519-public-key>' >&2; exit 1; }
public_key=$1
[[ $public_key =~ ^ssh-ed25519[[:space:]]+[A-Za-z0-9+/=]+([[:space:]].*)?$ ]] || { echo 'expected an Ed25519 SSH public key' >&2; exit 1; }

id -u "$DEPLOY_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos '' "$DEPLOY_USER"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
grep -Fxq "$public_key" "$DEPLOY_HOME/.ssh/authorized_keys" || printf '%s\n' "$public_key" >> "$DEPLOY_HOME/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"

install -d -o root -g root -m 755 "$ROOT_DIR/deploy"
install -o root -g root -m 644 "$(dirname "$0")/../compose.production.yaml" "$ROOT_DIR/deploy/compose.production.yaml"
install -o root -g root -m 755 "$(dirname "$0")/deploy-production.sh" /usr/local/sbin/ttt-deploy
install -o root -g root -m 755 "$(dirname "$0")/backup-production-db.sh" /usr/local/sbin/ttt-backup-db
install -o root -g root -m 755 "$(dirname "$0")/ttt-ghcr-login" /usr/local/sbin/ttt-ghcr-login
install -d -o root -g root -m 755 /etc/sudoers.d
cat > /etc/sudoers.d/ttt-deploy <<'SUDOERS'
Defaults:ttt-deploy !requiretty
ttt-deploy ALL=(root) NOPASSWD: /usr/local/sbin/ttt-deploy *, /usr/local/sbin/ttt-ghcr-login
SUDOERS
chmod 440 /etc/sudoers.d/ttt-deploy
visudo -cf /etc/sudoers.d/ttt-deploy

# Remove world-write access from the legacy app entrypoint without changing releases or data.
chown root:root "$ROOT_DIR/app"
chmod 755 "$ROOT_DIR/app"
printf 'Production deploy account installed. Configure the GitHub Actions secrets and workflow variable before enabling deployments.\n'
