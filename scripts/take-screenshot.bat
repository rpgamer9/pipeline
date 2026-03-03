@echo off
echo 📸 Starting screenshot process...

REM Create screenshots directory if it doesn't exist
if not exist screenshots mkdir screenshots
echo ✅ Screenshots directory ready

REM Build the app
echo 🏗️ Building the app...
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Build failed
  exit /b %errorlevel%
)

REM Run the screenshot script
echo 📸 Taking screenshot...
node scripts/take-screenshot.js

echo ✅ Done!