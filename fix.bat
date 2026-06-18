@echo off
cd /d "%~dp0"
call npm install babel-preset-expo@~54.0.10 --legacy-peer-deps
echo === DONE ===
