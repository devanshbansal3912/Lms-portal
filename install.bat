@echo off
echo ===================================================
echo Installing Student 3 LMS Dependencies...
echo ===================================================
call npm install
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Dependencies installed successfully!
    echo Run dev.bat or 'npm run dev' to launch the application.
) else (
    echo [ERROR] npm install encountered an error.
    echo Please make sure Node.js is installed from https://nodejs.org
)
pause
