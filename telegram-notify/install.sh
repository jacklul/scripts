#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
	exec sudo -- "$0" "$@"
	exit
fi

command -v curl >/dev/null 2>&1 || { echo "This script requires cURL to run, install it with 'sudo apt install curl'."; exit 1; }

SPATH=$(dirname $0)

if [ -f "$SPATH/telegram-notify" ] && [ -f "$SPATH/telegram-notify.conf" ]; then
	cp -v $SPATH/telegram-notify /usr/local/bin/telegram-notify && \
	chmod +x /usr/local/bin/telegram-notify

	if [ ! -f "/etc/telegram-notify.conf" ]; then
		cp -v $SPATH/telegram-notify.conf /etc/telegram-notify.conf
	fi
	
	if [ -f "$SPATH/telegram-notify@.service" ]; then
		cp -v $SPATH/telegram-notify@.service /etc/systemd/system/telegram-notify@.service
	fi
else
	exit 1
fi

echo "Override any unit file adding 'OnFailure=telegram-notify@%n' to '[Unit]' section to use service failure handler."
