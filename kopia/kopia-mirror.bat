@echo off
setlocal

set KOPIA_CHECK_FOR_UPDATES=false
set KOPIA_MIGRATE=false
set KOPIA_SYNC_PARALLEL=
set KOPIA_MIGRATE_PARALLEL=

:start
if exist "%~dp0config.conf" (
	for /F "delims= eol=#" %%A in (%~dp0config.conf) do set "%%A"
)

set interactive=false
mode con >nul 2>&1
if %errorlevel%==0 (
    set interactive=true
)

if "%~1"=="" (
	kopia --config-file="%KOPIA_MIRROR_CONFIG%" repository status
    echo.

    if /I "%KOPIA_MIGRATE%"=="true" (
	    echo Migrate latest snapshots from '%KOPIA_BACKUP_CONFIG%' to '%KOPIA_MIRROR_CONFIG%'

        if not [%KOPIA_MIGRATE_PARALLEL%] == [] (
            echo KOPIA_MIGRATE_PARALLEL ^= %KOPIA_MIGRATE_PARALLEL%
        )
    ) else (
	    echo Synchronize from '%KOPIA_BACKUP_CONFIG%' to '%KOPIA_MIRROR_CONFIG%'

        if not [%KOPIA_SYNC_PARALLEL%] == [] (
            echo KOPIA_SYNC_PARALLEL ^= %KOPIA_SYNC_PARALLEL%
        )
    )

	if /I "%interactive%"=="true" (
		echo.
		choice /C YN /M "Begin mirroring "
		if errorlevel 2 goto :eof
	)
) else if not "%1"=="run" (
	echo Using config file: %KOPIA_MIRROR_CONFIG%
	kopia --config-file="%KOPIA_MIRROR_CONFIG%" %*
	exit /B %ERRORLEVEL%
)

copy /Y "%APPDATA%\kopia\%KOPIA_MIRROR_CONFIG%" "%~dp0%KOPIA_MIRROR_CONFIG%.bak" >nul

if not [%KOPIA_SYNC_PARALLEL%] == [] (
    set PARALLEL_SYNC="--parallel=%KOPIA_SYNC_PARALLEL%"
)

if not [%KOPIA_MIGRATE_PARALLEL%] == [] (
    set PARALLEL_MIGRATE="--parallel=%KOPIA_MIGRATE_PARALLEL%"
)

:retry
echo.
if /I "%KOPIA_MIGRATE%"=="true" (
    kopia --config-file="%KOPIA_MIRROR_CONFIG%" snapshot migrate --source-config="%APPDATA%\kopia\%KOPIA_BACKUP_CONFIG%" --all --latest-only --policies --overwrite-policies %PARALLEL_MIGRATE%
	set EXITCODE=%ERRORLEVEL%
) else (
    kopia --config-file="%KOPIA_BACKUP_CONFIG%" repository sync-to from-config --file="%APPDATA%\kopia\%KOPIA_MIRROR_CONFIG%" --must-exist --delete %PARALLEL_SYNC%
	set EXITCODE=%ERRORLEVEL%
)

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
