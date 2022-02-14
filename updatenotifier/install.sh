#!/bin/bash

[ "$UID" -eq 0 ] || exec sudo bash "$0" "$@"

SPATH=$(dirname $0)

set -e

if [ "$1" != "full" ]; then
	echo "Bundled checkers and notifiers will not be installed!"
	echo "(use 'bash install.sh full' to install them)"
	echo
	
	read -p "Do you wish to continue? [y/N]: " -n 1 -r
	
	if ! [[ $REPLY =~ ^[Yy]$ ]]; then
		exit
	fi
	
	echo
fi

if [ -f "$SPATH/updatenotifier.sh" ] && [ -d "$SPATH/checkers" ] && [ -d "$SPATH/notifiers" ] && [ -f "$SPATH/updatenotifier.service" ] && [ -f "$SPATH/updatenotifier.timer" ]; then
	cp -v $SPATH/updatenotifier.sh /usr/local/sbin/updatenotifier && chmod 755 /usr/local/sbin/updatenotifier

	mkdir -vp /etc/updatenotifier/checkers
	mkdir -vp /etc/updatenotifier/notifiers
	
	if [ "$1" == "full" ]; then
		cp -vfr $SPATH/checkers /etc/updatenotifier
		cp -vfr $SPATH/notifiers /etc/updatenotifier
		chmod -R 644 /etc/updatenotifier
	fi
	
	cp -v $SPATH/updatenotifier.service /etc/systemd/system && chmod 644 /etc/systemd/system/updatenotifier.service
	cp -v $SPATH/updatenotifier.timer /etc/systemd/system && chmod 644 /etc/systemd/system/updatenotifier.timer
	
	command -v dos2unix >/dev/null 2>&1 && \
	dos2unix /usr/local/sbin/updatenotifier && \
	dos2unix /etc/updatenotifier/checkers/* && \
	dos2unix /etc/updatenotifier/notifiers/*
	
	mkdir -p /var/lib/updatenotifier

	echo "Enabling and starting updatenotifier.timer..."
	systemctl enable updatenotifier.timer && systemctl start updatenotifier.timer
else
	echo "Missing required files for installation!"
	exit 1
fi
