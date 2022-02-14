#!/bin/bash

[ "$UID" -eq 0 ] || exec sudo bash "$0" "$@"

SPATH=$(dirname $0)

set -e

if [ -f "$SPATH/new-device-notify.sh" ] && [ -f "$SPATH/new-device-notify.service" ]; then
	cp -v $SPATH/new-device-notify.sh /usr/local/sbin/new-device-notify && chmod 755 /usr/local/sbin/new-device-notify
	cp -v $SPATH/new-device-notify.service /etc/systemd/system && chmod 644 /etc/systemd/system/new-device-notify.service
	
	command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/new-device-notify
	
	echo "Enabling and starting new-device-notify.service..."
	systemctl enable new-device-notify.service && systemctl restart new-device-notify.service
else
	echo "Missing required files for installation!"
	exit 1
fi

