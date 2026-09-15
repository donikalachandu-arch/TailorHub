$nodePath = "C:\Users\CHANDU\OneDrive\Desktop\node_dist\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  TAILORHUB - A Smart Digital Platform for Tailoring" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting TailorHub Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$nodePath;' + `$env:PATH; cd 'C:\Users\CHANDU\OneDrive\Desktop\tailorhub\backend'; npm run dev"

Write-Host "[2/2] Starting TailorHub Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$nodePath;' + `$env:PATH; cd 'C:\Users\CHANDU\OneDrive\Desktop\tailorhub\frontend'; npm run dev"

Write-Host "`nTailorHub is up and running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
