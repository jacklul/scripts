#!/usr/bin/env bash
#shellcheck disable=SC2034,SC1091,SC2086

KOPIA_CHECK_FOR_UPDATES=false
KOPIA_MIGRATE=false
KOPIA_SYNC_PARALLEL=
KOPIA_MIGRATE_PARALLEL=

if [ -f "$HOME/.backup/config.conf" ]; then
    source "$HOME/.backup/config.conf"
fi

if [ -z "$1" ]; then
	kopia --config-file="$KOPIA_MIRROR_CONFIG" repository status
    echo

    if [ "$KOPIA_MIGRATE" = true ]; then
	    echo "Migrate latest snapshots from '$KOPIA_BACKUP_CONFIG' to '$KOPIA_MIRROR_CONFIG'"
        [ -n "$KOPIA_MIGRATE_PARALLEL" ] && echo "KOPIA_MIGRATE_PARALLEL = $KOPIA_MIGRATE_PARALLEL"
    else
	    echo "Synchronize from '$KOPIA_BACKUP_CONFIG' to '$KOPIA_MIRROR_CONFIG'"
        [ -n "$KOPIA_SYNC_PARALLEL" ] && echo "KOPIA_SYNC_PARALLEL = $KOPIA_SYNC_PARALLEL"
    fi

    if [[ $- == *i* ]]; then
        echo
        read -r -n 1 -p "Begin mirroring [Y,N]?" -s answer
        [[ $answer != [yY] ]] && exit 0
        echo
    fi
elif [ "$1" != "run" ]; then
	echo "Using config file: $KOPIA_MIRROR_CONFIG"
    kopia --config-file="$KOPIA_MIRROR_CONFIG" "$*"
    exit $?
fi

cp -f "$HOME/.config/kopia/$KOPIA_MIRROR_CONFIG" "$HOME/.backup/$KOPIA_MIRROR_CONFIG.bak"

[ -n "$KOPIA_SYNC_PARALLEL" ] && PARALLEL_SYNC="--parallel=$KOPIA_SYNC_PARALLEL"
[ -n "$KOPIA_MIGRATE_PARALLEL" ] && PARALLEL_MIGRATE="--parallel=$KOPIA_MIGRATE_PARALLEL"

EXITCODE=-1
while [ "$EXITCODE" -ne 0 ]; do
    echo

    if [ "$KOPIA_MIGRATE" = true ]; then
        kopia --config-file="$KOPIA_MIRROR_CONFIG" snapshot migrate --source-config="$HOME/.config/kopia/$KOPIA_BACKUP_CONFIG" --all --latest-only --policies --overwrite-policies $PARALLEL_MIGRATE
        EXITCODE=$?
    else
        kopia --config-file="$KOPIA_BACKUP_CONFIG" repository sync-to from-config --file="$HOME/.config/kopia/$KOPIA_MIRROR_CONFIG" --must-exist --delete $PARALLEL_SYNC
        EXITCODE=$?
    fi

    if [ "$EXITCODE" -ne 0 ] && [[ $- == *i* ]]; then
        echo
        read -r -n 1 -p "Command failed. Retry [Y,N]?" -s answer
        [[ $answer != [yY] ]] && exit $EXITCODE
        echo
    else
        exit $EXITCODE
    fi
done
