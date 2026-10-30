@echo off
setlocal
set "EXT_DIR=%~dp0"
set "BROWSER_EXE="
set "BROWSER_URL="

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  set "BROWSER_URL=chrome://extensions/"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  set "BROWSER_URL=chrome://extensions/"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
  set "BROWSER_URL=chrome://extensions/"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  set "BROWSER_URL=edge://extensions/"
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  set "BROWSER_URL=edge://extensions/"
)

if not defined BROWSER_EXE (
  echo Chrome or Edge was not found in standard install folders.
  echo Open chrome://extensions or edge://extensions manually.
  pause
  exit /b 1
)

start "" "%BROWSER_EXE%" "%BROWSER_URL%"
start "" explorer.exe "%EXT_DIR%"
echo Enable Developer mode, choose Load unpacked, then select:
echo %EXT_DIR%
pause
