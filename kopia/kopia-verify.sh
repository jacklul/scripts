#!/usr/bin/env bash

percent=1
[ -n "$2" ] && percent="$2"

echo "Checking backup - $percent% of all files"

kopia_backup_script="$(command -v kopia-backup)"
if [ -z "$kopia_backup_script" ]; then
    kopia_backup_script="bash kopia-backup.sh"
fi

$kopia_backup_script "$1" snapshot verify --verify-files-percent="$percent"
exitcode=$?

if [ "$exitcode" -ne 0 ] && [ -t 0 ]; then
    read -rp "Press Enter to continue..."
fi

exit $exitcode
