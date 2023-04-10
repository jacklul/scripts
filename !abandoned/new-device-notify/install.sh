#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( new-device-notify.sh new-device-notify.service new-device-notify.timer )

set -e

for FILE in "${REQUIRED_FILES[@]}"; do
	if [ ! -f "$SPATH/$FILE" ]; then
		echo "Missing required file for installation: $FILE"
		exit 1
	fi
done

cp -v "$SPATH/new-device-notify.sh" /usr/local/sbin/new-device-notify && chmod 755 /usr/local/sbin/new-device-notify
cp -v "$SPATH/new-device-notify.service" /etc/systemd/system && chmod 644 /etc/systemd/system/new-device-notify.service
cp -v "$SPATH/new-device-notify.timer" /etc/systemd/system && chmod 644 /etc/systemd/system/new-device-notify.timer

if [ ! -f "/etc/new-device-notify.conf" ]; then
	if [ -f "$SPATH/new-device-notify.conf" ]; then
		cp -v "$SPATH/new-device-notify.conf" /etc/new-device-notify.conf
	fi
else
	#shellcheck disable=SC1091
	. "/etc/new-device-notify.conf"
fi

command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/new-device-notify

if [ -n "$RUN_AS_DAEMON" ]; then
	if [ "$RUN_AS_DAEMON" == "true" ]; then
		if systemctl is-enabled --quiet new-device-notify.timer; then
			systemctl stop new-device-notify.timer && systemctl disable new-device-notify.timer
		fi

		echo "Enabling and starting new-device-notify.service..."
		systemctl enable new-device-notify.service && systemctl restart new-device-notify.service
	else
		if systemctl is-enabled --quiet new-device-notify.service; then
			systemctl stop new-device-notify.service && systemctl disable new-device-notify.service
		fi

		echo "Enabling and starting new-device-notify.timer..."
		systemctl enable new-device-notify.timer && systemctl start new-device-notify.timer
	fi
fi
