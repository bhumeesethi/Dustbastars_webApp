@echo off
title DustBustars - 1-Click Phone Runner
color 0a

echo ===================================================
echo     DustBustars - Direct Phone Deploy
echo ===================================================
echo.

cd /d "%~dp0"

:: Set Java Home from Android Studio
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH%"

echo [1/3] Syncing web assets...
call npx cap sync android

echo.
echo [2/3] Building and installing APK to connected phone...
cd android
call gradlew installDebug

echo.
echo [3/3] Launching DustBustars on your phone...
adb reverse tcp:3000 tcp:3000
adb shell am start -n com.dustbustars.app/com.dustbustars.app.MainActivity

echo.
echo ===================================================
echo  [DONE] App is now running on your phone!
echo ===================================================
pause
