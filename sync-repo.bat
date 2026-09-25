@echo off
setlocal enabledelayedexpansion
title TailorHub Repository Auto-Sync
echo ========================================================
echo       TAILORHUB GITHUB 1-CLICK AUTO-SYNCHRONIZER
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/4] Checking repository status...
git remote -v
echo.

echo [2/4] Pulling latest changes from GitHub...
git pull --rebase origin main

echo.
echo [3/4] Staging all local modifications...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    echo Committing changes at !mydate! !mytime!...
    git commit -m "sync: automated update on !mydate! !mytime!"
) else (
    echo No new local changes to commit.
)

echo.
echo [4/4] Pushing to GitHub (origin/main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS: Repository is 100%% Synchronized with GitHub!
    echo  https://github.com/donikalachandu-arch/TailorHub
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check internet connection or GitHub credentials.
)

pause
