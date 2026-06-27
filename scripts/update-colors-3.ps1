$ErrorActionPreference = 'Stop'

$root = 'src/app'
$files = Get-ChildItem -Path $root -Recurse -Include *.css

foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $original = $c

    # Catch rgba with spaces around commas
    $c = $c -replace 'rgba\(255,\s*107,\s*71,', 'rgba(255, 91, 46,'
    $c = $c -replace 'rgba\(30,\s*42,\s*74,', 'rgba(15, 22, 40,'
    $c = $c -replace 'rgba\(255,\s*107,\s*53,', 'rgba(255, 91, 46,'
    $c = $c -replace 'rgba\(0,\s*229,\s*255,', 'rgba(255, 91, 46,'

    if ($c -ne $original) {
        Set-Content -Path $f.FullName -Value $c -NoNewline
        Write-Host "Updated: $($f.FullName)"
    }
}

Write-Host "Done."
