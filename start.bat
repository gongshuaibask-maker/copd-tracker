@echo off
cd /d "%~dp0"
echo ==========================================
echo   COPD App - Expo Dev Server
echo ==========================================
echo.
echo After Metro bundler starts, open Expo Go
echo on your phone and scan the QR code.
echo.
echo Make sure phone and PC are on same WiFi.
echo.
echo Press Ctrl+C to stop the server.
echo ==========================================
echo.
call npx expo start --clear
pause
