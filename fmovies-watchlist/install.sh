#!/bin/bash

if [ "$UID" -eq 0 ]; then
	echo This cannot be run as root
	exit
fi

SPATH=$(dirname "$0")
set -e

if [ -f "$SPATH/fmovies-watchlist.php" ] && [ -f "$SPATH/fmovies-watchlist.service" ] && [ -f "$SPATH/fmovies-watchlist.timer" ]; then
	mkdir -pv ~/.local/bin
	cp -v "$SPATH/fmovies-watchlist.php" ~/.local/bin/fmovies-watchlist && chmod 755 ~/.local/bin/fmovies-watchlist

	mkdir -pv ~/.config/systemd/user/
	cp -v "$SPATH/fmovies-watchlist.service" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/fmovies-watchlist.service
	cp -v "$SPATH/fmovies-watchlist.timer" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/fmovies-watchlist.timer

	command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/fmovies-watchlist

	echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable fmovies-watchlist.timer && systemctl --user start fmovies-watchlist.timer\""
	echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

	systemctl daemon-reload --user
else
	echo "Missing required files for installation!"
	exit 1
fi
