@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"
set "NO_PAUSE="
if /i "%~1"=="--no-pause" set "NO_PAUSE=1"

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "CLOUDFLARED_EXE=%PROJECT_DIR%\tools\cloudflared.exe"
set "CF_LOG=%TEMP%\trpg_cloudflared.log"
set "SHARE_LINK_FILE=%PROJECT_DIR%\public_share_link.txt"
set "CF_METRICS_TMP=%TEMP%\trpg_cloudflared_metrics.tmp"

if exist "%PROJECT_DIR%\stop_trpg_server.bat" (
  call "%PROJECT_DIR%\stop_trpg_server.bat" --silent >nul 2>nul
)

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
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    exit /b 1
  )
)

if not exist "tools" mkdir "tools"
if not exist "%CLOUDFLARED_EXE%" (
  echo [INFO] Downloading cloudflared...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%CLOUDFLARED_EXE%'"
  if errorlevel 1 (
    echo [ERROR] Failed to download cloudflared.
    exit /b 1
  )
)

if exist "%CF_LOG%" del /f /q "%CF_LOG%" >nul 2>nul

echo [INFO] Starting TRPG server...
start "TRPG Server" cmd /c "cd /d ""%PROJECT_DIR%"" && npm.cmd start"

echo [INFO] Starting public tunnel...
echo [INFO] Closing previous cloudflared process (if any)...
powershell -NoProfile -Command "Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
ping -n 2 127.0.0.1 >nul

set "CF_PID="
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$p=Start-Process -FilePath '%CLOUDFLARED_EXE%' -ArgumentList @('tunnel','--url','http://localhost:3000','--no-autoupdate','--loglevel','info','--logfile','%CF_LOG%') -WorkingDirectory '%PROJECT_DIR%' -PassThru; if($p){Write-Output $p.Id}"`) do (
  set "CF_PID=%%P"
)
if defined CF_PID (
  echo [INFO] Tunnel process started. PID: %CF_PID%
) else (
  echo [ERROR] Failed to start cloudflared process.
  exit /b 1
)

if defined INVITE_TOKEN (
  echo [INFO] Opening GM page...
  start "" "http://localhost:3000/?invite=%INVITE_TOKEN%"
) else (
  echo [WARN] invite_token.txt not found. Open page manually after start.
)

echo [INFO] Waiting for tunnel URL...
set "TUNNEL_URL="
set /a URL_WAIT_SEC=60
:wait_tunnel_url
set "TUNNEL_URL="
if exist "%CF_METRICS_TMP%" del /f /q "%CF_METRICS_TMP%" >nul 2>nul
curl.exe -sS "http://127.0.0.1:20241/metrics" -o "%CF_METRICS_TMP%" >nul 2>nul
if exist "%CF_METRICS_TMP%" (
  for /f "delims=" %%L in ('findstr /C:trycloudflare.com "%CF_METRICS_TMP%"') do (
    set "LINE=%%L"
    set "LINE=!LINE:"=!"
    set "LINE=!LINE:*https://=https://!"
    for /f "tokens=1 delims=}" %%U in ("!LINE!") do (
      set "TUNNEL_URL=%%U"
    )
  )
)
if defined TUNNEL_URL goto :tunnel_url_ready
set /a URL_WAIT_SEC-=1
if %URL_WAIT_SEC% LEQ 0 goto :tunnel_url_missing
ping -n 2 127.0.0.1 >nul
goto :wait_tunnel_url

:tunnel_url_ready
if defined INVITE_TOKEN (
  set "SHARE_URL=%TUNNEL_URL%/?invite=%INVITE_TOKEN%"
) else (
  set "SHARE_URL=%TUNNEL_URL%"
)
>"%SHARE_LINK_FILE%" echo %SHARE_URL%
echo %SHARE_URL% | clip
echo %SHARE_URL%
echo FINAL_SHARE_URL=%SHARE_URL%
echo [SHARE] %SHARE_URL%
echo [INFO] Saved share link: %SHARE_LINK_FILE%
echo [INFO] Copied share link to clipboard.
goto :after_tunnel_url

:tunnel_url_missing
echo [ERROR] Tunnel URL not found yet.
echo [INFO] Check log: %CF_LOG%

:after_tunnel_url
if exist "%CF_METRICS_TMP%" del /f /q "%CF_METRICS_TMP%" >nul 2>nul

echo.
echo [INFO] Keep both windows open while session is running.
echo [INFO] To fully stop later: run_trpg_server.bat stop
if not defined NO_PAUSE (
  echo [INFO] Press any key to close this window.
  pause >nul
)
endlocal
