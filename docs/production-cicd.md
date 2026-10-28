# Production CI/CD

The workflow in `.github/workflows/production.yml` runs typecheck, lint, Vitest, a Next.js production build, and a Docker image build for pull requests. A successful `main` run publishes an immutable `ghcr.io/wuwuyn/tinhtinhtingting:<commit-sha>` image. Production deploys use the inactive Compose slot and switch Nginx only after strict application, database, Payload, and storage checks pass.

## Server setup already applied

- The `ttt-deploy` account has a dedicated Ed25519 SSH key and narrowly scoped passwordless sudo for the root-owned deployment and GHCR login scripts.
- Root-owned deployment files are installed under `/opt/tinhtinhtingting/deploy`; runtime credentials remain under `/opt/tinhtinhtingting/runtime`.
- The app uses loopback ports `3211` and `3213`. Port `3212` is occupied by another service.
- The first successful migration takes custom-format backups of both configured databases before starting the candidate container. A failed backup blocks the deployment.
- The running systemd service on `3210` remains as the initial rollback target.

## GitHub repository settings

Add these Actions secrets in the repository settings:

| Secret | Value |
| --- | --- |
| `PRODUCTION_HOST` | `14.225.168.98` |
| `PRODUCTION_USER` | `ttt-deploy` |
| `PRODUCTION_SSH_KEY` | Contents of `C:\Users\iamwu\.ssh\ttt-production-deploy` |
| `PRODUCTION_KNOWN_HOSTS` | The pinned SSH host key line below |
| `GHCR_READ_TOKEN` | A GitHub token for the package owner with `read:packages` only |

Pinned host key for `PRODUCTION_KNOWN_HOSTS`:

```text
14.225.168.98 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMfmapzK5bmWYPKDVVoK4lrOum8A/r7TO+M9/2C3MVpY
```

The first cutover is started manually with **Actions → Production CI/CD → Run workflow** on `main`. If a required reviewer is added to the `production` environment for that run, remove that protection after the first cutover so later successful pushes to `main` can deploy automatically. Set the Actions variable `PRODUCTION_DEPLOY_ENABLED` to `true` only after the first production cutover succeeds.

## Required database repair before first deployment

The production runtime file initially had stale credentials. Its `APP_DATABASE_URL` and `PAYLOAD_DATABASE_URL` values have been updated from the repository's `.env.local`; both still point to `aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`, so the existing Supabase databases and data were preserved. The old runtime file is backed up at `/opt/tinhtinhtingting/backups/runtime-before-supabase-env-update-20261014.env` with mode `0600`. Do not set `PAYLOAD_DB_PUSH=true` for this rollout.

The service was restarted with the refreshed credentials. Its local and public health checks now return `200` with `status: "ok"`, `database: true`, and `payload: true`; the health route reports local storage and a healthy result. The homepage also returns `200` over HTTPS. Custom-format backups for both databases are at `/opt/tinhtinhtingting/backups/db-initial-20261013T201422Z/`; both dumps passed `pg_restore --list` and are mode `0600`.

The application has not been switched to Compose yet. Before the first manual workflow run, configure the repository Actions secrets listed above and confirm the GHCR package can be read from the server. Keep `PRODUCTION_DEPLOY_ENABLED` unset until the manual first cutover and observation period succeed. The deploy script enforces the full health response including `storageHealthy: true` and leaves Nginx unchanged when a check fails.
