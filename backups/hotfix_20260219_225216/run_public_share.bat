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
if not exist "tools\\cloudflared.exe" (
  echo [INFO] Downloading cloudflared...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '.\\tools\\cloudflared.exe'"
  if errorlevel 1 (
    echo [ERROR] Failed to download cloudflared.
    exit /b 1
  )
)

if exist "cloudflared.log" del /f /q "cloudflared.log" >nul 2>nul

echo [INFO] Starting TRPG server...
start "TRPG Server" cmd /c "cd /d \"%~dp0\" && npm.cmd start"

echo [INFO] Starting public tunnel...
start "TRPG Tunnel" cmd /c "cd /d \"%~dp0\" && tools\\cloudflared.exe tunnel --url http://localhost:3000 --no-autoupdate --loglevel info --logfile cloudflared.log"

if defined INVITE_TOKEN (
  echo [INFO] Opening GM page...
  start "" "http://localhost:3000/?invite=%INVITE_TOKEN%"
) else (
  echo [WARN] invite_token.txt not found. Open page manually after start.
)

echo [INFO] Waiting for tunnel URL...
powershell -NoProfile -Command ^
  "$deadline=(Get-Date).AddSeconds(25);" ^
  "$url='';" ^
  "while((Get-Date) -lt $deadline -and -not $url){" ^
  "  if(Test-Path '.\\cloudflared.log'){" ^
  "    $m=Select-String -Path '.\\cloudflared.log' -Pattern 'https://[-a-z0-9]+\\.trycloudflare\\.com' | Select-Object -Last 1;" ^
  "    if($m){$url=$m.Matches[0].Value}" ^
  "  }" ^
  "  if(-not $url){Start-Sleep -Milliseconds 500}" ^
  "};" ^
  "$token=''; if(Test-Path '.\\invite_token.txt'){$token=(Get-Content '.\\invite_token.txt' | Select-Object -First 1).Trim()};" ^
  "if($url -and $token){Write-Host ('[SHARE] ' + $url + '/?invite=' + $token)} elseif($url){Write-Host ('[SHARE_BASE] ' + $url)} else {Write-Host '[ERROR] Tunnel URL not found yet. Check cloudflared.log.'}"

echo.
echo [INFO] Keep both windows open while session is running.
endlocal
