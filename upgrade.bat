@echo off
cd /d "%~dp0"
echo === Upgrading to Expo SDK 54 ===
echo Step 1: Install expo@latest
call npm install expo@^54.0.0 --save
echo.
echo Step 2: Fix all dependencies to match SDK 54
call npx expo install --fix
echo.
echo Step 3: Clean and restart
echo === UPGRADE DONE ===
echo.
echo Now double-click start.bat to launch
pause
