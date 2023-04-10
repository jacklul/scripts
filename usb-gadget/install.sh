#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( usb-gadget.sh usb-gadget.service usb-gadget.conf )
DOWNLOAD_PATH=usb-gadget
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/main/usb-gadget

set -e

MISSING_FILES=0
for FILE in "${REQUIRED_FILES[@]}"; do
	if [ ! -f "$SPATH/$FILE" ]; then
		MISSING_FILES=$((MISSING_FILES+1))
	fi
done

if [ "$MISSING_FILES" -gt 0 ]; then
	if [ "$MISSING_FILES" != "${#MISSING_FILES[@]}" ]; then
		mkdir -v "$SPATH/$DOWNLOAD_PATH"
		SPATH="$SPATH/$DOWNLOAD_PATH"
	fi

	for FILE in "${REQUIRED_FILES[@]}"; do
		if [ ! -f "$SPATH/$FILE" ]; then
			wget -nv -O "$SPATH/$FILE" "$DOWNLOAD_URL/$FILE"
		fi
	done
fi

for FILE in "${REQUIRED_FILES[@]}"; do
	if [ ! -f "$SPATH/$FILE" ]; then
		echo "Missing required file for installation: $FILE"
		exit 1
	fi
done

cp -v "$SPATH/usb-gadget.sh" /usr/local/sbin/usb-gadget && chmod 755 /usr/local/sbin/usb-gadget
cp -v "$SPATH/usb-gadget.service" /etc/systemd/system && chmod 644 /etc/systemd/system/usb-gadget.service

command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/usb-gadget

if [ ! -f "/etc/usb-gadget.conf" ] && [ -f "$SPATH/usb-gadget.conf" ]; then
	cp -v "$SPATH/usb-gadget.conf" /etc/usb-gadget.conf
fi

echo "Edit configuration in /etc/usb-gadget.conf"
echo "Then enable the service: \"sudo systemctl enable usb-gadget.service && sudo systemctl start usb-gadget.service\""
