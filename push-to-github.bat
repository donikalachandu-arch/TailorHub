@echo off
setlocal
echo ========================================================
echo       TAILORHUB GITHUB REPOSITORY PUSH WIZARD
echo ========================================================
echo.
echo Please create a new empty repository on https://github.com/new
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/tailorhub.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b 1
)

echo.
echo [1/3] Setting remote origin to %REPO_URL%...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [2/3] Setting default branch to main...
git branch -M main

echo [3/3] Pushing complete codebase to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Code pushed to GitHub.
    echo  You can now connect this repo to Vercel and Render!
    echo ========================================================
) else (
    echo.
    echo [NOTE] If asked for login, use your GitHub Username and Personal Access Token.
)

pause
