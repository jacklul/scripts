#!/bin/bash

if [ "$UID" -eq 0 ]; then
	echo This cannot be run as root
	exit
fi

SPATH=$(dirname $0)
set -e

if [ -f "$SPATH/dst-reward-links.php" ] && [ -f "$SPATH/dst-reward-links.service" ] && [ -f "$SPATH/dst-reward-links.timer" ]; then
	mkdir -pv ~/.local/bin
	cp -v $SPATH/dst-reward-links.php ~/.local/bin/dst-reward-links && chmod 755 ~/.local/bin/dst-reward-links

	mkdir -pv ~/.config/systemd/user/
	cp -v $SPATH/dst-reward-links.service ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/dst-reward-links.service
	cp -v $SPATH/dst-reward-links.timer ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/dst-reward-links.timer

	command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/dst-reward-links

	echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable dst-reward-links.timer && systemctl --user start dst-reward-links.timer\""
	echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

	systemctl daemon-reload --user
else
	echo "Missing required files for installation!"
	exit 1
fi
