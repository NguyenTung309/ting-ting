param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$TargetDatabase
)

if (-not (Test-Path -LiteralPath $InputPath)) { throw "Backup not found: $InputPath" }
Write-Warning "This restores into the explicit app database '$TargetDatabase'. Use a disposable restore database for rehearsal."
Get-Content -LiteralPath $InputPath -Raw | docker compose exec -T app-db psql -U tingting_app -d $TargetDatabase -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw "psql restore failed" }
Write-Output "Restore completed: $TargetDatabase"
