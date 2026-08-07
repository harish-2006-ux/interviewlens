@echo off
echo Starting AI Interview Practice System...
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm run setup
    echo.
)

REM Check if .env exists and has API key
if not exist "server\.env" (
    echo Please add your Gemini API key to server\.env
    echo Visit https://aistudio.google.com/ to get an API key
    pause
    exit /b 1
)

findstr /c:"your_gemini_api_key_here" server\.env >nul
if %errorlevel%==0 (
    echo Please replace "your_gemini_api_key_here" with your actual Gemini API key in server\.env
    pause
    exit /b 1
)

echo Starting MongoDB (make sure MongoDB is installed)...
start "MongoDB" cmd /k "mongod --dbpath data"

timeout /t 3 /nobreak > nul

echo Seeding sample data...
call npm run seed

echo.
echo Starting application...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.

npm run dev