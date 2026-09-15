@echo off
setlocal
echo ========================================================
echo       TAILORHUB FRONTEND VERCEL DEPLOYMENT
echo ========================================================
echo.
cd /d "%~dp0frontend"
echo [1/2] Building frontend for production...
call npm run build

echo.
echo [2/2] Launching Vercel deployment...
call npx vercel --prod

pause
