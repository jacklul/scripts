#!/bin/bash

if [ "$UID" -eq 0 ]; then
	echo This cannot be run as root
	exit
fi

SPATH=$(dirname $0)
set -e

if [ -f "$SPATH/miap-controller.js" ] && [ -f "$SPATH/miap-controller.service" ]; then
	mkdir -pv ~/.local/bin
	cp -v $SPATH/miap-controller.js ~/.local/bin/miap-controller && chmod 755 ~/.local/bin/miap-controller

	mkdir -pv ~/.config/systemd/user/
	cp -v $SPATH/miap-controller.service ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/miap-controller.service
	
	command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/miap-controller
	
	echo -e "\nTo enable service use this command:"
	echo "systemctl --user enable miap-controller.service"
	echo "You might also need to run loginctl enable-linger $USER to enable launch of services and timers when user is not logged in"

	systemctl daemon-reload --user
else
	echo "Missing required files for installation!"
	exit 1
fi

