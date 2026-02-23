@echo off
setlocal

cd /d "%~dp0"

set "INVITE_TOKEN="
if exist "invite_token.txt" (
  for /f "usebackq delims=" %%A in ("invite_token.txt") do (
    set "INVITE_TOKEN=%%A"
    goto :token_loaded
  )
)
:token_loaded

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install Node.js first: https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [INFO] Starting TRPG server...
if defined INVITE_TOKEN (
  echo [INFO] URL: http://localhost:3000/?invite=%INVITE_TOKEN%
  start "" "http://localhost:3000/?invite=%INVITE_TOKEN%"
) else (
  echo [WARN] invite_token.txt not found. Open URL manually.
  echo [INFO] URL: http://localhost:3000
  start "" "http://localhost:3000"
)
call npm.cmd start

echo.
echo [INFO] Server stopped.
pause
endlocal
