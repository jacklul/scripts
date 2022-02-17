#!/bin/bash

[ "$UID" -eq 0 ] || exec sudo bash "$0" "$@"

SPATH=$(dirname $0)

set -e

if [ -f "$SPATH/new-device-notify.sh" ] && [ -f "$SPATH/new-device-notify.service" ] && [ -f "$SPATH/new-device-notify.timer" ] && [ -f "$SPATH/new-device-notify.conf" ]; then
	cp -v $SPATH/new-device-notify.sh /usr/local/sbin/new-device-notify && chmod 755 /usr/local/sbin/new-device-notify
	cp -v $SPATH/new-device-notify.service /etc/systemd/system && chmod 644 /etc/systemd/system/new-device-notify.service
	cp -v $SPATH/new-device-notify.timer /etc/systemd/system && chmod 644 /etc/systemd/system/new-device-notify.timer
	
	if [ ! -f "/etc/new-device-notify.conf" ]; then
		cp -v $SPATH/new-device-notify.conf /etc/new-device-notify.conf
	else
		. "/etc/new-device-notify.conf"
	fi

	command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/new-device-notify
	
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
else
	echo "Missing required files for installation!"
	exit 1
fi

