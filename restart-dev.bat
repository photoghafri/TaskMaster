@echo off
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Cleaning .next directory...
if exist .next (
  rd /s /q .next 2>nul
)

echo Generating Prisma client...
npx prisma generate

echo Starting development server safely...
npm run dev:safe 