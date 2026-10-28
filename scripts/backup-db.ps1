param(
  [string]$OutputPath = "backups\tinhtinhtingting-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
)

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory) { New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null }
docker compose exec -T app-db pg_dump -U tingting_app -d tingting_app --no-owner --no-privileges | Out-File -FilePath $OutputPath -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed" }
Write-Output "Backup created: $OutputPath"
