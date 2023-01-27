#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/apt-update-notify.sh
#
# Override apt-daily.service:
#  [Service]
#  ExecStartPost=/opt/helpers/apt-update-notify.sh

STATEFILE=/var/lib/apt/update-notify.state

if ([ -f "$STATEFILE" ] && [ ! -w "$STATEFILE" ]) || [ ! -w "$(dirname $STATEFILE)" ] ; then
	echo "Unable to obtain read-write access to $STATEFILE"
	exit 1
fi

if [ ! -d "$(dirname $STATEFILE)" ] ; then
	mkdir -p $(dirname $STATEFILE)
fi

if [ ! -f "$STATEFILE" ] ; then
	echo "" > "$STATEFILE"
fi

OLDSTATE=`cat "$STATEFILE"`
STATE=$(apt list --upgradable 2> /dev/null | awk '{if(NR>1)print}' | awk -F '\[upgradable from' '{print $1}' | awk '{print $1,$2}')

if [ "$OLDSTATE" != "$STATE" ]; then
	if [ "$STATE" != "" ]; then
		COUNT=$(echo "$STATE" | wc -l)
		MESSAGE=$([ "$COUNT" -gt 1 ] && echo "There are $COUNT updates available:" || echo "There is 1 update available:")

		/usr/local/bin/telegram-notify --quiet --warning --title "APT Updates @ $(hostname -f)" --text "*$MESSAGE*\n$STATE" --protect
	fi

	echo -e "$STATE" > "$STATEFILE"
fi
