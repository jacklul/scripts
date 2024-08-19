@echo off
setlocal EnableDelayedExpansion

set interactive=false
mode con >nul 2>&1
if %errorlevel%==0 (
    set interactive=true
)

if exist "%~dp0kopia-backup.conf" (
	for /F "delims= eol=#" %%A in (%~dp0kopia-backup.conf) do set "%%A"
) else if exist "%USERPROFILE%/.backup/kopia-backup.conf" (
	for /F "delims= eol=#" %%A in (%USERPROFILE%/.backup/kopia-backup.conf) do set "%%A"
)

if "%~1"=="" (
    echo Destination config not provided
    exit /b 1
)

set arg=%1
set arg_upper=
set "args=%*"
set "args=!args:*%1 =!"
for /f "usebackq delims=" %%I in (`powershell "\"%arg%\".toUpper()"`) do set "arg_upper=%%~I"
if "%arg%" == "%args%" (
   set args=
)

set "kopia_config=!KOPIA_%arg_upper%_CONFIG!"
set "kopia_opts=!KOPIA_%arg_upper%_OPTS!"

if [%args%] == [] (
	kopia --config-file="%kopia_config%" repository status

	if /I "%interactive%" == "true" (
		echo.
		choice /C YN /M "Begin backup "
		if errorlevel 2 goto :eof
	)
) else if not "%args%" == "run" (
	kopia --config-file="%kopia_config%" %args%
	exit /B %ERRORLEVEL%
)

:retry
echo.
kopia --config-file="%kopia_config%" snapshot create --all %kopia_opts%
set exitcode=%ERRORLEVEL%

if not "%exitcode%" == "0" (
	if /I "%interactive%" == "true" (
        echo.
		choice /C YN /M "Command failed. Retry "
		if errorlevel 2 goto end
		if errorlevel 1 goto retry
	)
)

:end
exit /B %exitcode%
