@echo off
setlocal

cd /d "%~dp0"

set "RUN_MODE=%~1"
if /i "%RUN_MODE%"=="local" goto :local_mode
if /i "%RUN_MODE%"=="--local" goto :local_mode
if /i "%RUN_MODE%"=="/local" goto :local_mode
if /i "%RUN_MODE%"=="stop" goto :stop_mode
if /i "%RUN_MODE%"=="--stop" goto :stop_mode
if /i "%RUN_MODE%"=="/stop" goto :stop_mode

if exist "run_public_share.bat" (
  echo [INFO] Public share mode - Cloudflare tunnel started.
  echo [INFO] If you want local-only mode, run: run_trpg_server.bat local
  echo [INFO] To fully stop later, run: run_trpg_server.bat stop
  call "run_public_share.bat"
  exit /b %errorlevel%
)

echo [WARN] run_public_share.bat not found. Falling back to local-only mode.

:stop_mode
if exist "stop_trpg_server.bat" (
  call "stop_trpg_server.bat"
  exit /b %errorlevel%
)
echo [WARN] stop_trpg_server.bat not found. Trying fallback stop...
taskkill /IM cloudflared.exe /F >nul 2>nul
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:"^ *TCP .*:3000 .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>nul
)
echo [INFO] Stop attempt finished.
exit /b 0

:local_mode

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
