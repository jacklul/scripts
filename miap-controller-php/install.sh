#!/bin/bash

SPATH=$(dirname $0)
set -e

if [ -f "$SPATH/miap-controller.phar" ] && [ -f "$SPATH/miap-controller-user.service" ] && [ -f "$SPATH/miap-controller-system.service" ]; then
	if [ "$UID" -eq 0 ]; then
		cp -v $SPATH/miap-controller.phar /usr/local/bin/miap-controller && chmod 755 /usr/local/bin/miap-controller
		cp -v $SPATH/miap-controller-system.service /etc/systemd/system/miap-controller.service && chmod 644 /etc/systemd/system/miap-controller.service
		
		command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/bin/miap-controller
		
		echo -e "\nTo enable service use this command:"
		echo "systemctl enable miap-controller.service"

		systemctl daemon-reload
	else
		mkdir -pv ~/.local/bin
		cp -v $SPATH/miap-controller.phar ~/.local/bin/miap-controller && chmod 755 ~/.local/bin/miap-controller

		mkdir -pv ~/.config/systemd/user/
		cp -v $SPATH/miap-controller-user.service ~/.config/systemd/user/miap-controller.service && chmod 644 ~/.config/systemd/user/miap-controller.service
		
		command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/miap-controller
		
		echo -e "\nTo enable service use this command:"
		echo "systemctl --user enable miap-controller.service"
		echo "You might also need to run loginctl enable-linger $USER to enable launch of services and timers when user is not logged in"

		systemctl daemon-reload --user
	fi
else
	echo "Missing required files for installation!"
	exit 1
fi

