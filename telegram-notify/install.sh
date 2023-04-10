#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "This script requires cURL to run!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( telegram-notify.sh telegram-notify@.service telegram-notify-updatecheck.sh )
DOWNLOAD_PATH=telegram-notify
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/telegram-notify
DOWNLOAD_URL_ORIGINAL=https://raw.githubusercontent.com/NicolasBernaerts/debian-scripts/master/telegram

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
			if [ "$FILE" = "telegram-notify.sh" ] &&  wget -nv -O "$SPATH/telegram-notify.sh" "$DOWNLOAD_URL_ORIGINAL/telegram-notify"; then
				continue
			fi
			
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

cp -v "$SPATH/telegram-notify.sh" /usr/local/bin/telegram-notify && \
chmod +x /usr/local/bin/telegram-notify

cp -v "$SPATH/telegram-notify@.service" /etc/systemd/system/telegram-notify@.service

if [ -f "$SPATH/telegram-notify-updatecheck.sh" ]; then
	echo "Installing update checker..."

	MERGE=$(tail -n +3 "$SPATH/telegram-notify-updatecheck.sh")
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

command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/bin/telegram-notify

echo "Override any unit file adding 'OnFailure=telegram-notify@%n' to '[Unit]' section to use service failure handler."
