@echo off
title HR Manager & Salary Analytics Dashboard (std6730251506)
color 0B
echo ========================================================
echo   Starting HR Manager & Salary Analytics Dashboard...
echo ========================================================
where node >nul 2>nul
if %errorlevel% equ 0 (
    node serve_frontend.js
) else (
    start "" "%~dp0frontend\index.html"
    echo Opened frontend directly in your default browser!
    pause
)
