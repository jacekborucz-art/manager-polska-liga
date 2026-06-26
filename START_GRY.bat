@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if exist "runtime\node.exe" (
  set "NODE_EXE=%CD%\runtime\node.exe"
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo.
    echo Nie znaleziono Node.js.
    echo.
    echo Do wersji portable dodaj plik:
    echo runtime\node.exe
    echo.
    echo Na tym komputerze mozesz tez zainstalowac Node.js albo uruchomic:
    echo npm run build
    echo npm run preview
    echo.
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)

if not exist "dist\index.html" (
  echo.
  echo Brak gotowego buildu gry: dist\index.html
  echo Uruchom najpierw:
  echo npm run build
  echo.
  pause
  exit /b 1
)

set "FM_PORT="
for /l %%P in (4173,1,4183) do (
  if "!FM_PORT!"=="" (
    netstat -ano -p tcp | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
    if errorlevel 1 set "FM_PORT=%%P"
  )
)

if "%FM_PORT%"=="" (
  echo.
  echo Nie udalo sie znalezc wolnego portu od 4173 do 4183.
  echo Zamknij inne uruchomione okna gry i sprobuj ponownie.
  echo.
  pause
  exit /b 1
)

set "FM_URL=http://127.0.0.1:%FM_PORT%"
set "BROWSER_OPENED=0"

start "Futbol Manager - lokalny serwer" cmd /c ""%NODE_EXE%" "%CD%\server.cjs""

timeout /t 2 /nobreak >nul

call :OPEN_BROWSER
exit /b 0

:OPEN_BROWSER
rem Edge / Chrome / Brave / Opera wspieraja tryb --app.
call :TRY_APP_BROWSER "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "msedge"
if "%BROWSER_OPENED%"=="1" exit /b 0

call :TRY_APP_BROWSER "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%LocalAppData%\Google\Chrome\Application\chrome.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "chrome"
if "%BROWSER_OPENED%"=="1" exit /b 0

call :TRY_APP_BROWSER "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "brave"
if "%BROWSER_OPENED%"=="1" exit /b 0

call :TRY_APP_BROWSER "%LocalAppData%\Programs\Opera\opera.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%LocalAppData%\Programs\Opera GX\opera.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%ProgramFiles%\Opera\opera.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "%ProgramFiles(x86)%\Opera\opera.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_APP_BROWSER "opera"
if "%BROWSER_OPENED%"=="1" exit /b 0

call :TRY_FIREFOX "%ProgramFiles%\Mozilla Firefox\firefox.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_FIREFOX "%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_FIREFOX "%LocalAppData%\Mozilla Firefox\firefox.exe"
if "%BROWSER_OPENED%"=="1" exit /b 0
call :TRY_FIREFOX "firefox"
if "%BROWSER_OPENED%"=="1" exit /b 0

start "" %FM_URL%
exit /b 0

:TRY_APP_BROWSER
set "BROWSER_EXE=%~1"
if exist "%BROWSER_EXE%" (
  start "" "%BROWSER_EXE%" --app=%FM_URL%
  set "BROWSER_OPENED=1"
  exit /b 0
)
where "%BROWSER_EXE%" >nul 2>nul
if not errorlevel 1 (
  start "" "%BROWSER_EXE%" --app=%FM_URL%
  set "BROWSER_OPENED=1"
  exit /b 0
)
exit /b 0

:TRY_FIREFOX
set "BROWSER_EXE=%~1"
if exist "%BROWSER_EXE%" (
  start "" "%BROWSER_EXE%" --kiosk %FM_URL%
  set "BROWSER_OPENED=1"
  exit /b 0
)
where "%BROWSER_EXE%" >nul 2>nul
if not errorlevel 1 (
  start "" "%BROWSER_EXE%" --kiosk %FM_URL%
  set "BROWSER_OPENED=1"
  exit /b 0
)
exit /b 0
