#!/bin/bash

[ "$UID" -eq 0 ] || exec sudo bash "$0" "$@"

SPATH=$(dirname $0)

set -e

if [ -f "$SPATH/simple-upnpd" ]; then
	cp -v $SPATH/simple-upnpd /usr/local/bin/simple-upnpd && chmod 755 /usr/local/bin/simple-upnpd
	
	if [ -f "$SPATH/simple-upnpd.xml" ] && [ ! -f "/etc/simple-upnpd.xml" ]; then
		cp -v $SPATH/simple-upnpd.xml /etc/simple-upnpd.xml && chmod 644 /etc/simple-upnpd.xml
		
		# (Re)Generate UUID
		sed "s@<UDN>.*</UDN>@<UDN>uuid:$(cat /proc/sys/kernel/random/uuid)</UDN>@" -i /etc/simple-upnpd.xml
		
		command -v dos2unix >/dev/null 2>&1 && dos2unix /etc/simple-upnpd.xml
	elif [ -f "$SPATH/description.xml" ] && [ ! -f "/etc/simple-upnpd.xml" ]; then
		cp -v $SPATH/description.xml /etc/simple-upnpd.xml && chmod 644 /etc/simple-upnpd.xml
	fi
	
	cp -v $SPATH/simple-upnpd.service /etc/systemd/system && chmod 644 /etc/systemd/system/simple-upnpd.service
	
	echo "Enabling and starting simple-upnpd.service..."
	systemctl enable simple-upnpd.service && systemctl restart simple-upnpd.service
else
	echo "Missing required files for installation!"
	exit 1
fi
