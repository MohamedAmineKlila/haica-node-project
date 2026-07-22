@echo off
setlocal

cd /d "%~dp0"
title HAICA Admin Launcher

echo.
echo ========================================
echo   HAICA Admin
echo ========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or not available in PATH.
  echo Please install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    goto failed
  )
  popd
)

if not exist "backend\node_modules" (
  echo Installing backend dependencies...
  pushd backend
  call npm install
  if errorlevel 1 (
    popd
    goto failed
  )
  popd
)

if not exist "backend\node_modules\.prisma\client\index.js" (
  echo Preparing Prisma client...
  pushd backend
  call npm exec prisma -- generate
  if errorlevel 1 (
    popd
    goto failed
  )
  popd
) else (
  echo Prisma client already prepared.
)

call :is_port_open 3000
if errorlevel 1 (
  echo Starting backend on http://127.0.0.1:3000
  start /B cmd /c "cd /d "%~dp0backend" && npm run dev"
) else (
  echo Backend already running on port 3000.
)

call :is_port_open 5173
if errorlevel 1 (
  echo Starting frontend on http://127.0.0.1:5173
  start /B cmd /c "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1"
) else (
  echo Frontend already running on port 5173.
)

echo.
echo Opening HAICA Admin...
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173/login?fresh=1"

echo.
echo ========================================
echo   Both servers are running in this window.
echo   Close this window to stop everything.
echo ========================================
pause
exit /b 0

:is_port_open
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -State Listen -LocalPort %1 -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
exit /b %errorlevel%

:failed
echo.
echo Something failed while starting HAICA Admin.
pause
exit /b 1
