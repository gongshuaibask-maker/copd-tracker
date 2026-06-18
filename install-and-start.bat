@echo off
title COPD App - Setting Up...
cd /d "%~dp0"

echo ============================================
echo   Step 1/3: Cleaning node_modules...
echo ============================================
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo   Done.

echo ============================================
echo   Step 2/3: npm install (this will take a few minutes)...
echo ============================================
call npm install --legacy-peer-deps

echo ============================================
echo   Step 3/3: Starting Expo...
echo ============================================
echo   After QR appears, scan with your phone camera.
echo   Or use Safari to open exp://192.168.1.6:8081
echo ============================================
call npx expo start --clear
pause
