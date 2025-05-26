@echo off
echo Starting Project Management App...
echo.

rem Kill any existing Node.js processes
taskkill /f /im node.exe >nul 2>&1

rem Clean the .next directory
call npm run clean

rem Start the application with tracing disabled
set NEXT_TELEMETRY_DISABLED=1
set NEXT_DISABLE_SOURCEMAPS=1
set NODE_OPTIONS=--no-warnings

echo Starting Next.js server...
call npx next dev

pause 