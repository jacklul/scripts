#!/usr/bin/env bash
#shellcheck disable=SC1091,SC2086

if [ -f "$PWD/kopia-backup.conf" ]; then
    source "$PWD/kopia-backup.conf"
elif [ -f "$HOME/.backup/kopia-backup.conf" ]; then
    source "$HOME/.backup/kopia-backup.conf"
fi

[ -z "$1" ] && { echo "Destination config not provided"; exit 1; }
arg=$1
shift

kopia_confg_var="KOPIA_${arg^^}_CONFIG"
kopia_confg="${!kopia_confg_var}"
kopia_opts_var="KOPIA_${arg^^}_OPTS"
kopia_opts="${!kopia_opts_var}"

if [ -z "$1" ]; then
    kopia --config-file="$kopia_confg" repository status

    if [ -t 0 ]; then
        echo; read -r -n 1 -p "Begin backup? [Y/N]: " answer; echo
        [[ $answer != [yY] ]] && exit 0
    fi
elif [ "$1" != "run" ]; then
    exec kopia --config-file="$kopia_confg" "$@"
fi

exitcode=-1
while [ "$exitcode" -ne 0 ]; do
    echo
    kopia --config-file="$kopia_confg" snapshot create --all $kopia_opts
    exitcode=$?

    if [ "$exitcode" -ne 0 ] && [ -t 0 ]; then
        echo; read -r -n 1 -p "Backup command failed. Retry? [Y/N]: " answer; echo
        [[ $answer == [yY] ]] && continue
    fi

    exit $exitcode
done
