@echo off
title Push to GitHub (IP-Final-Exam)
color 0E
echo ========================================================
echo   Pushing code to GitHub: peerakornn-boop/IP-Final-Exam
echo ========================================================
cd /d "%~dp0"
node push_to_github.js %1
pause
