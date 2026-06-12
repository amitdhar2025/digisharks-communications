$file = 'src\app\(public)\digital-products\[slug]\page.tsx'
$content = Get-Content -Path $file -Raw
$content = $content -replace 'margin: 0 auto;', 'margin: 80px auto 0 auto;'
Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Done"
