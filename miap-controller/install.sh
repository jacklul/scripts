#!/bin/bash

command -v php >/dev/null 2>&1 || { echo "Command 'php' not found!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( miap-controller.phar )
DOWNLOAD_PATH=/tmp/miap-controller
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/miap-controller

if [ "$UID" -eq 0 ]; then
	REQUIRED_FILES+=("$SPATH/miap-controller-system.service")
else
	REQUIRED_FILES+=("$SPATH/miap-controller-user.service")
fi

set -e

MISSING_FILES=0
for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && MISSING_FILES=$((MISSING_FILES+1))
done

if [ "$MISSING_FILES" -gt 0 ]; then
    if [ "$MISSING_FILES" = "${#REQUIRED_FILES[@]}" ]; then
        mkdir -pv "$DOWNLOAD_PATH"
        SPATH="$DOWNLOAD_PATH"
    fi

    for FILE in "${REQUIRED_FILES[@]}"; do
        [ ! -f "$SPATH/$FILE" ] && wget -nv -O "$SPATH/$FILE" "$DOWNLOAD_URL/$FILE"
    done
fi

for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && { echo "Missing required file for installation: $FILE"; exit 1; }
done

if [ "$UID" -eq 0 ]; then
	cp -v "$SPATH/miap-controller.phar" /usr/local/bin/miap-controller && chmod 755 /usr/local/bin/miap-controller
	cp -v "$SPATH/miap-controller-system.service" /etc/systemd/system/miap-controller.service && chmod 644 /etc/systemd/system/miap-controller.service

	if [ ! -f "/etc/miap-controller.conf" ] && [ -f "$SPATH/miap-controller.conf.example" ]; then
		cp -v "$SPATH/miap-controller.conf.example" /etc/miap-controller.conf
	fi

	echo -e "\nTo enable the service use this command: \"sudo systemctl enable miap-controller.service\""

	systemctl daemon-reload
else
	mkdir -pv ~/.local/bin
	cp -v "$SPATH/miap-controller.phar" ~/.local/bin/miap-controller && chmod 755 ~/.local/bin/miap-controller

	mkdir -pv ~/.config/systemd/user/
	cp -v "$SPATH/miap-controller-user.service" ~/.config/systemd/user/miap-controller.service && chmod 644 ~/.config/systemd/user/miap-controller.service
	
	if [ ! -f "/home/$USER/.config/miap-controller.conf" ] && [ -f "$SPATH/miap-controller.conf.example" ]; then
		cp -v "$SPATH/miap-controller.conf.example" "/home/$USER/.config/miap-controller.conf"
	fi

	echo -e "\nTo enable the service use this command: \"systemctl --user enable miap-controller.service\""
	echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of services for not logged in users"

	systemctl daemon-reload --user
fi
