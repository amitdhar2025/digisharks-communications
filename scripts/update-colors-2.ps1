$ErrorActionPreference = 'Stop'

$root = 'src/app'
$files = Get-ChildItem -Path $root -Recurse -Include *.css

foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $original = $c

    # Legacy orange hex codes (ff6b35 variant) -> FF5B2E
    $c = $c -replace '#ff6b35', '#FF5B2E'
    $c = $c -replace '#FF6B35', '#FF5B2E'
    $c = $c -replace '#e85a2a', '#E04A1F'  # darker orange variants

    # Body text gray (374151) -> 4A5568 in stat label contexts (matches spec)
    # Be careful: only replace in places where it's clearly a label color
    $c = $c -replace '#374151', '#4A5568'

    # Neutral gray (#64748B -> #6B7280)
    $c = $c -replace '#64748B', '#6B7280'
    $c = $c -replace '#64748b', '#6B7280'

    # Footer cream (F7F3EC) -> light gray (F8F9FB) per spec
    $c = $c -replace '#F7F3EC', '#F8F9FB'

    # Old section backgrounds -> light gray per spec
    $c = $c -replace '#FBF6EC', '#F8F9FB'
    $c = $c -replace '#F1F4F8', '#F8F9FB'
    $c = $c -replace '#FFF4EE', '#F8F9FB'

    # 1F2937 -> 4A5568 (body text color)
    $c = $c -replace '#1F2937', '#4A5568'
    $c = $c -replace '#1f2937', '#4A5568'

    if ($c -ne $original) {
        Set-Content -Path $f.FullName -Value $c -NoNewline
        Write-Host "Updated: $($f.FullName)"
    }
}

Write-Host "Done."
