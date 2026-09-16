@echo off
title DustBustars - Open Android Studio
color 0a

echo ===================================================
echo     DustBustars - Mobile Android Studio Launcher
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Syncing Capacitor native assets and plugins...
call npx cap sync android

echo.
echo [2/2] Opening project in Android Studio...
call npx cap open android

echo.
echo [DONE] Android Studio has been launched.
pause
