@echo off
REM ========================================
REM 部署前预处理脚本
REM 将 landing 页面的隐私政策/支持/英文版
REM 复制到 deploy_app 目录
REM ========================================

echo [1/3] 复制隐私政策页面...
xcopy /E /I /Y "%~dp0..\landing\privacy-policy" "%~dp0..\deploy_app\privacy-policy" >nul

echo [2/3] 复制技术支持页面...
xcopy /E /I /Y "%~dp0..\landing\support" "%~dp0..\deploy_app\support" >nul

echo [3/3] 复制英文 landing page...
xcopy /E /I /Y "%~dp0..\landing\en" "%~dp0..\deploy_app\en" >nul

echo ✅ 部署预处理完成！
echo.
echo 现在可以运行以下命令部署到 Netlify：
echo   npx netlify deploy --prod --dir=deploy_app
echo.
pause
