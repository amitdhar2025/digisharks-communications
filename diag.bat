@echo off
echo --- LISTENING PORTS ---
netstat -ano | findstr LISTENING | findstr ":3000 :3001 :3002 :3003"
echo.
echo --- DEV SERVER LOG (last 60 lines) ---
powershell -NoProfile -Command "if (Test-Path 'c:\DG\digisharks-communications\dev-server.log') { Get-Content 'c:\DG\digisharks-communications\dev-server.log' -Tail 60 } else { Write-Host 'No dev-server.log' }"
