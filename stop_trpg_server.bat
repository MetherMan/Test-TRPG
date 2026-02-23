@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

set "SILENT="
if /i "%~1"=="--silent" set "SILENT=1"

if not defined SILENT echo [INFO] Stopping TRPG server/tunnel...

set "FOUND_3000="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  if not "%%P"=="0" (
    set "FOUND_3000=1"
    taskkill /PID %%P /F >nul 2>nul
    if not defined SILENT echo [INFO] Stopped PID %%P - port 3000 listener.
  )
)
if not defined FOUND_3000 if not defined SILENT echo [INFO] No listener on port 3000.

taskkill /IM cloudflared.exe /F >nul 2>nul
if not defined SILENT (
  if errorlevel 1 (
    echo [INFO] cloudflared.exe not running.
  ) else (
    echo [INFO] Stopped cloudflared.exe.
  )
)

if not defined SILENT (
  ping -n 2 127.0.0.1 >nul
  set "LEFT_3000="
  for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do set "LEFT_3000=1"
  tasklist /FI "IMAGENAME eq cloudflared.exe" /FO CSV /NH | findstr /I /C:"cloudflared.exe" >nul
  set "LEFT_CF="
  if not errorlevel 1 set "LEFT_CF=1"

  if not defined LEFT_3000 if not defined LEFT_CF (
    echo [OK] TRPG server/tunnel fully stopped.
  ) else (
    echo [WARN] Some processes may still remain. Run again once if needed.
  )
)

endlocal
exit /b 0
