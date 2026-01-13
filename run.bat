@echo off
echo ===================================================
echo   Authenticity Validator - Launcher
echo ===================================================

echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo.
echo Starting Frontend Application (Port 3001)...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo ===================================================
echo   Application started!
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3001
echo ===================================================
echo   (Close this window to stop nothing - close the other windows to stop servers)
pause
