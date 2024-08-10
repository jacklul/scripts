#!/usr/bin/env bash
#shellcheck disable=SC2034,SC1091,SC2086

KOPIA_CHECK_FOR_UPDATES=false
KOPIA_BACKUP_PARALLEL=

if [ -f "$HOME/.backup/config.conf" ]; then
    source "$HOME/.backup/config.conf"
fi

if [ -z "$1" ]; then
    kopia --config-file="$KOPIA_BACKUP_CONFIG" repository status
    echo
    echo "Create backup using config '$KOPIA_BACKUP_CONFIG'"
    [ -n "$KOPIA_BACKUP_PARALLEL" ] && echo "KOPIA_BACKUP_PARALLEL = $KOPIA_BACKUP_PARALLEL"

    if [[ $- == *i* ]]; then
        echo
        read -r -n 1 -p "Begin backup [Y,N]?" -s answer
        [[ $answer != [yY] ]] && exit 0
        echo
    fi
elif [ "$1" != "run" ]; then
	echo "Using config file: $KOPIA_BACKUP_CONFIG"
    kopia --config-file="$KOPIA_BACKUP_CONFIG" "$*"
    exit $?
fi

cp -f "$HOME/.config/kopia/$KOPIA_BACKUP_CONFIG" "$HOME/.backup/$KOPIA_BACKUP_CONFIG.bak"

[ -n "$KOPIA_BACKUP_PARALLEL" ] && PARALLEL="--parallel=$KOPIA_BACKUP_PARALLEL"

EXITCODE=-1
while [ "$EXITCODE" -ne 0 ]; do
    echo
    kopia --config-file="$KOPIA_BACKUP_CONFIG" snapshot create --all $PARALLEL
    EXITCODE=$?

    if [ "$EXITCODE" -ne 0 ] && [[ $- == *i* ]]; then
        echo
        read -r -n 1 -p "Command failed. Retry [Y,N]?" -s answer
        [[ $answer != [yY] ]] && exit $EXITCODE
        echo
    else
        exit $EXITCODE
    fi
done
