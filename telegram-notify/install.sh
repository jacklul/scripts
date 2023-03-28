#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
	exec sudo -- "$0" "$@"
	exit
fi

command -v curl >/dev/null 2>&1 || { echo "This script requires cURL to run, install it with 'sudo apt install curl'."; exit 1; }

SPATH=$(dirname "$0")

if [ -f "$SPATH/telegram-notify" ]; then
	cp -v "$SPATH/telegram-notify" /usr/local/bin/telegram-notify && \
	chmod +x /usr/local/bin/telegram-notify

	if [ -f "$SPATH/telegram-notify-updatecheck" ]; then
		echo "Installing update checker..."

		MERGE=$(tail -n +3 "$SPATH/telegram-notify-updatecheck")
		MATCH=$(awk '/#   Notification/{ print NR; exit }' /usr/local/bin/telegram-notify)

		if [ "$MATCH" != "" ]; then
			#shellcheck disable=SC2005
			echo "$({ head -n $((MATCH-2)) /usr/local/bin/telegram-notify; echo "$MERGE"; tail -n +$((MATCH-2)) /usr/local/bin/telegram-notify; })" > /usr/local/bin/telegram-notify
		else
			echo "Update checker installation failed - cannot find anchor point to insert the code"
		fi
	fi

	if [ ! -f "/etc/telegram-notify.conf" ] && [ -f "$SPATH/telegram-notify.conf" ]; then
		cp -v "$SPATH/telegram-notify.conf" /etc/telegram-notify.conf
	fi
	
	if [ -f "$SPATH/telegram-notify@.service" ]; then
		cp -v "$SPATH/telegram-notify@.service" /etc/systemd/system/telegram-notify@.service
	fi

	command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/bin/telegram-notify
else
	exit 1
fi

echo "Override any unit file adding 'OnFailure=telegram-notify@%n' to '[Unit]' section to use service failure handler."
