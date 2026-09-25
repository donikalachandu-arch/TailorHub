# TailorHub 1-Click PowerShell Auto-Synchronizer
$ErrorActionPreference = "Stop"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      TAILORHUB GITHUB 1-CLICK AUTO-SYNCHRONIZER       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "`n[1/4] Pulling latest changes from GitHub..." -ForegroundColor Green
git pull --rebase origin main

Write-Host "`n[2/4] Staging all changes..." -ForegroundColor Green
git add .

$status = git status --porcelain
if ($status) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "`n[3/4] Committing updates ($timestamp)..." -ForegroundColor Green
    git commit -m "sync: automated update on $timestamp"
} else {
    Write-Host "`n[3/4] No local modifications to commit." -ForegroundColor DarkGray
}

Write-Host "`n[4/4] Pushing to GitHub (origin/main)..." -ForegroundColor Green
git push origin main

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: Repository is 100% in sync with GitHub!" -ForegroundColor Green
Write-Host " URL: https://github.com/donikalachandu-arch/TailorHub" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
