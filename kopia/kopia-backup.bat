@echo off
setlocal

set KOPIA_CHECK_FOR_UPDATES=false
set KOPIA_BACKUP_PARALLEL=

set interactive=false
mode con >nul 2>&1
if %errorlevel%==0 (
    set interactive=true
)

:start
if exist "%~dp0config.conf" (
	for /F "delims= eol=#" %%A in (%~dp0config.conf) do set "%%A"
)

if [%1] == [] (
	kopia --config-file="%KOPIA_BACKUP_CONFIG%" repository status
    echo.
	echo Create backup using config '%KOPIA_BACKUP_CONFIG%'

    if not [%KOPIA_BACKUP_PARALLEL%] == [] (
	    echo KOPIA_BACKUP_PARALLEL ^= %KOPIA_BACKUP_PARALLEL%
    )

	if /I "%interactive%"=="true" (
		echo.
		choice /C YN /M "Begin backup "
		if errorlevel 2 goto :eof
	)
) else if not "%1"=="run" (
	echo Using config file: %KOPIA_BACKUP_CONFIG%
	kopia --config-file="%KOPIA_BACKUP_CONFIG%" %*
	exit /B %ERRORLEVEL%
)

copy /Y "%APPDATA%\kopia\%KOPIA_BACKUP_CONFIG%" "%~dp0%KOPIA_BACKUP_CONFIG%.bak" >nul

if not [%KOPIA_BACKUP_PARALLEL%] == [] (
    set PARALLEL="--parallel=%KOPIA_BACKUP_PARALLEL%"
)

:retry
echo.
kopia --config-file="%KOPIA_BACKUP_CONFIG%" snapshot create --all %PARALLEL%
set EXITCODE=%ERRORLEVEL%

if not "%EXITCODE%"=="0" (
	if /I "%interactive%"=="true" (
		rundll32 user32.dll,MessageBeep
        echo.
		choice /C YN /M "Command failed. Retry "
		if errorlevel 2 goto end
		if errorlevel 1 goto retry
	)
)

:end
exit /B %EXITCODE%
