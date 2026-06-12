$ErrorActionPreference = 'Stop'

Write-Host "=== Test contact form with email confirmation ==="
$body = @{
  fullName = "Priya Sharma"
  email = "priya.sharma@example.com"
  phone = "+91 98765 12345"
  service = "Digital PR"
  message = "Hi, I would like to know more about your Digital PR services for our new SaaS startup."
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "http://localhost:3000/api/contact" -Method Post -ContentType "application/json" -Body $body
Write-Host "Success: $($res.success)"
Write-Host "Record id: $($res.id)"
Write-Host "Email sent: $($res.email.sent)"
Write-Host "Email mode: $($res.email.mode)"

if ($res.email.preview) {
  Write-Host ""
  Write-Host "=== Email preview (first 200 chars) ==="
  Write-Host $res.email.preview.Substring(0, [Math]::Min(800, $res.email.preview.Length))
}

Write-Host ""
Write-Host "=== Check public pages still load ==="
foreach ($p in @("/contact-us", "/", "/admin/login", "/admin/dashboard")) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000$p" -Method Get -UseBasicParsing
    Write-Host "OK   $($r.StatusCode) $p"
  } catch {
    Write-Host "ERR  $($_.Exception.Response.StatusCode.value__) $p"
  }
}
