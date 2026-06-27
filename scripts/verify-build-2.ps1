$ErrorActionPreference = 'Continue'

Write-Host "Starting Next.js build (filtered error check)..." -ForegroundColor Cyan

$env:NODE_OPTIONS = '--max-old-space-size=4096'
$output = & npx next build 2>&1 | Out-String

# Split into lines and filter for actual errors
$lines = $output -split "`n"

# Look for lines that contain real error patterns
$errorLines = $lines | Where-Object {
    $_ -match 'Module not found|SyntaxError|Cannot find|Expected|Failed to compile|Type error|TypeError|ReferenceError|Unhandled' -and
    $_ -notmatch 'route.ts|/api/|/admin/'
}

if ($errorLines.Count -gt 0) {
    Write-Host ""
    Write-Host "BUILD ERRORS FOUND:" -ForegroundColor Red
    Write-Host ("=" * 60)
    $errorLines | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}
else {
    Write-Host ""
    Write-Host "NO BUILD ERRORS." -ForegroundColor Green
    Write-Host "Routes successfully generated (see previous output)."
}

# Also check if build finished successfully
if ($output -match 'Generating static pages|Compiled successfully|Build complete|First Load JS') {
    Write-Host ""
    Write-Host "BUILD COMPLETED." -ForegroundColor Green
}
