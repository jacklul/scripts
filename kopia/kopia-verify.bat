@echo off
setlocal

set percent=1
if not [%2] == [] (
    set percent=%2
)

echo Checking backup - %percent%^%% of all files

kopia-backup "%1" snapshot verify --verify-files-percent="%percent%"
set exitcode=%ERRORLEVEL%

if not "%exitcode%" == "0" (
    pause
)

exit /B %exitcode%
