#!/usr/bin/env bash

if [ "$2" = "full" ]; then
    full="--full"
    echo "Performing full maintenance"
else
    echo "Performing quick maintenance"
fi

kopia_backup_script="$(command -v kopia-backup)"
if [ -z "$kopia_backup_script" ]; then
    kopia_backup_script="bash kopia-backup.sh"
fi

#shellcheck disable=SC2086
$kopia_backup_script "$1" maintenance run $full
exitcode=$?

if [ "$exitcode" -ne 0 ] && [ -t 0 ]; then
    read -rp "Press Enter to continue..."
fi

exit $exitcode
