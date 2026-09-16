@echo off
title DustBustars Web & Mobile Dev Server
color 0b

echo ===================================================
echo     DustBustars - Easy Launcher (Windows)
echo ===================================================
echo.

:: Move to current project directory
cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

:: 2. Check if .env.local exists
if not exist ".env.local" (
    echo [INFO] .env.local not found. Creating from .env.example...
    copy ".env.example" ".env.local"
    echo [OK] .env.local created.
    echo.
)

:: 3. Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] node_modules folder missing. Installing dependencies...
    echo This may take a minute on the first run...
    call npm install
    if %errorlevel% neq 0 (
        echo [WARN] Standard install failed. Retrying with --legacy-peer-deps...
        call npm install --legacy-peer-deps
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: 4. Automatically open the browser after server starts (runs in background)
start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"

echo ===================================================
echo   Starting Next.js Development Server...
echo   App URL: http://localhost:3000
echo   Press Ctrl + C anytime to stop the server.
echo ===================================================
echo.

call npm run dev

pause
