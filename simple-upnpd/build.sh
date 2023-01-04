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

if [ ! -f "$(dirname $0)/simple-upnpd.c" ]; then
	if [ -d "$(dirname $0)/tmpcheckoutdir" ]; then
		rm -fr "$(dirname $0)/tmpcheckoutdir"
	fi
	
	mkdir -v "$(dirname $0)/tmpcheckoutdir"
	git clone  https://github.com/victronenergy/simple-upnpd.git "$(dirname $0)/repo"
	mv -fv "$(dirname $0)/tmpcheckoutdir/.git" "$(dirname $0)"
	git reset --hard HEAD
	rmdir "$(dirname $0)/tmpcheckoutdir"
fi

make clean
make
