@echo off
setlocal
set "ROOT=%~dp0.."
set "DIST=%ROOT%dist"
if not exist "%DIST%" mkdir "%DIST%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$root = [IO.Path]::GetFullPath('%ROOT%'); $dist = [IO.Path]::GetFullPath('%DIST%'); $zip = Join-Path $dist 'wedit-web-store.zip'; if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }; Compress-Archive -LiteralPath (Join-Path $root 'manifest.json'),(Join-Path $root 'content.js'),(Join-Path $root 'background.js'),(Join-Path $root 'icons') -DestinationPath $zip -Force; Write-Output ('Created ' + $zip)"
if errorlevel 1 exit /b 1
pause
