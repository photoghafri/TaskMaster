# Stop any running Node.js processes
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean .next directory
Write-Host "Cleaning .next directory..." -ForegroundColor Yellow
if (Test-Path -Path '.next') {
    Remove-Item -Path '.next' -Recurse -Force -ErrorAction SilentlyContinue
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:NEXT_TELEMETRY_DISABLED = 1

# Start development server
Write-Host "Starting development server safely..." -ForegroundColor Green
npm run dev:safe 