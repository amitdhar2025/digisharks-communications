$ErrorActionPreference = 'Continue'

Write-Host "Starting Next.js build..." -ForegroundColor Cyan

$env:NODE_OPTIONS = '--max-old-space-size=4096'
$output = & npx next build 2>&1 | Out-String

Write-Host "Build output (last 80 lines):" -ForegroundColor Yellow
$lines = $output -split "`n"
$last = $lines | Select-Object -Last 80
$last | ForEach-Object { Write-Host $_ }

if ($output -match 'error|Error|ERROR|Failed') {
    Write-Host ""
    Write-Host "Errors found in output." -ForegroundColor Red
}
else {
    Write-Host ""
    Write-Host "No errors detected." -ForegroundColor Green
}
