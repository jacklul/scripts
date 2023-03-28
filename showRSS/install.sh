#!/bin/bash

if [ "$UID" -eq 0 ]; then
	echo This cannot be run as root
	exit
fi

SPATH=$(dirname "$0")
set -e

if [ -f "$SPATH/showRSS.php" ] && [ -f "$SPATH/showRSS.service" ] && [ -f "$SPATH/showRSS.timer" ]; then
	mkdir -pv ~/.local/bin
	cp -v "$SPATH/showRSS.php" ~/.local/bin/showRSS && chmod 755 ~/.local/bin/showRSS
	
	mkdir -pv ~/.config/systemd/user/
	cp -v "$SPATH/showRSS.service" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/showRSS.service
	cp -v "$SPATH/showRSS.timer" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/showRSS.timer
	
	command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/showRSS
	
	echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable showRSS.timer && systemctl --user start showRSS.timer\""
	echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

	systemctl daemon-reload --user
else
	echo "Missing required files for installation!"
	exit 1
fi
