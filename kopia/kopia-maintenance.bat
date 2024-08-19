@echo off
setlocal

if "%2" == "full" (
    set full="--full"
    echo Performing full maintenance
) else (
    echo Performing quick maintenance
)

kopia-backup "%1" maintenance run %full%
set exitcode=%ERRORLEVEL%

if not "%exitcode%" == "0" (
    pause
)

exit /B %exitcode%
