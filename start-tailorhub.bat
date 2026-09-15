@echo off
title TailorHub Platform
echo ========================================================
echo   TAILORHUB - A Smart Digital Platform for Tailoring
echo ========================================================
echo.
set "PATH=%~dp0..\node_dist\node-v20.18.0-win-x64;%PATH%"

echo [1/2] Starting TailorHub Backend Server (Port 5000)...
start "TailorHub Backend" cmd /k "cd /d %~dp0backend && set PATH=%~dp0..\node_dist\node-v20.18.0-win-x64;%PATH% && npm run dev"

echo [2/2] Starting TailorHub Frontend Web/Mobile UI (Port 3000)...
start "TailorHub Frontend" cmd /k "cd /d %~dp0frontend && set PATH=%~dp0..\node_dist\node-v20.18.0-win-x64;%PATH% && npm run dev"

echo.
echo ========================================================
echo   TailorHub is starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
