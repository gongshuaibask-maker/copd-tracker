@echo off
chcp 65001 >nul
title COPD APP - GitHub Setup
cls
echo ========================================
echo  COPD Self-Management - GitHub 仓库初始化
echo ========================================
echo.
echo 步骤 1/3: 登录 GitHub（浏览器会打开）
echo.
gh auth login --web -p https -w
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 登录失败，请手动运行：
    echo    gh auth login --web
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ 登录成功！
echo.
echo 步骤 2/3: 创建 GitHub 仓库并推送代码
echo.
gh repo create copd-tracker --public --push --source=. --remote=origin
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 创建失败，可能是仓库名已存在
    echo 尝试备用名称 copd-self-management ...
    gh repo create copd-self-management --public --push --source=. --remote=origin
)
echo.
echo 步骤 3/3: 设置上游分支
git push --set-upstream origin main
echo.
echo ========================================
echo  🎉 完成！
echo.
echo  仓库地址：https://github.com/gongshuai888/copd-tracker
echo  或：       https://github.com/gongshuai888/copd-self-management
echo.
echo  接下来更新 PH 发布材料中的链接即可。
echo ========================================
pause
