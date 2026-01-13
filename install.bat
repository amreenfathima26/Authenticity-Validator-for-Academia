@echo off
echo ===================================================
echo   Authenticity Validator - Automatic Installer
echo ===================================================

echo.
echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Seeding Database...
call node seed_data.js
if %errorlevel% neq 0 (
    echo Error seeding database!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   Installation Complete!
echo   You can now run the project using 'run.bat'
echo ===================================================
cd ..
pause
