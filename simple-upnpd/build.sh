#!/bin/bash

set -e

REQUIRED=("make" "build-essential" "libgupnp-1.0-dev")
NOTINSTALLED=

for package in "${REQUIRED[@]}"
do 
	if [ $(dpkg-query -W -f='${Status}' $package 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
		NOTINSTALLED+=" $package"
	fi
done

if [ "$NOTINSTALLED" != "" ]; then
	sudo apt install $NOTINSTALLED
fi

if [ ! -f "$(dirname $0)/source/simple-upnpd.c" ]; then
	if [ ! -d "$(dirname $0)/source" ]; then
		mkdir -v "$(dirname $0)/source"
	fi

	git clone https://github.com/victronenergy/simple-upnpd.git "$(dirname $0)/source"
fi

cd "$(dirname $0)/source"
make clean
make

if [ -f "simple-upnpd" ]; then
	cp -v simple-upnpd ../simple-upnpd
fi
