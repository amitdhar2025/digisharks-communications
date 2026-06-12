Set-Location 'c:\DG\digisharks-communications'
$output = npx tsc --noEmit 2>&1
$errors = $output | Where-Object { $_ -match 'error TS' }
if ($errors) {
    Write-Host "FOUND ERRORS:"
    $errors | Select-Object -First 30
} else {
    Write-Host "No TypeScript errors found!"
}
Write-Host "Total errors: $($errors.Count)"
