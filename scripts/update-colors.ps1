$ErrorActionPreference = 'Stop'

$root = 'src/app'
$files = Get-ChildItem -Path $root -Recurse -Include *.css

foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $original = $c

    # Orange hex codes (old FF6B47 -> new FF5B2E)
    $c = $c -replace '#FF6B47', '#FF5B2E'
    $c = $c -replace '#ff6b47', '#FF5B2E'

    # Navy hex codes (old 1E2A4A -> new 0F1628)
    $c = $c -replace '#1E2A4A', '#0F1628'
    $c = $c -replace '#1e2a4a', '#0F1628'

    # Old orange rgba (255,107,71 -> 255,91,46)
    $c = $c -replace 'rgba\(255,107,71,', 'rgba(255,91,46,'

    # Old navy rgba (30,42,74 -> 15,22,40)
    $c = $c -replace 'rgba\(30,42,74,', 'rgba(15,22,40,'

    # Old cyan rgba (0,229,255 -> 255,91,46) — orange replaces cyan glow
    $c = $c -replace 'rgba\(0,229,255,', 'rgba(255,91,46,'

    # Body text gray (374151 -> 4A5568) for non-stat contexts
    # Skip this — only update in places that look like body text
    # Leaving for now

    if ($c -ne $original) {
        Set-Content -Path $f.FullName -Value $c -NoNewline
        Write-Host "Updated: $($f.FullName)"
    }
}

Write-Host "Done."
