#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/apt-update-notify.sh
#
# Override apt-daily.service:
#  [Service]
#  ExecStartPost=/opt/helpers/apt-update-notify.sh
#
# To automatically clean the state once packages are updated:
#  sudo nano /etc/apt/apt.conf.d/90update-notify
#  ----------------------------------------------------------------------
#  DPkg::Post-Invoke {"/opt/helpers/apt-update-notify.sh postdpkg";};
#  ----------------------------------------------------------------------

STATEFILE=/var/lib/apt/update-notify.state

if [ -f "$STATEFILE" ] && [ ! -w "$STATEFILE" ] || [ ! -w "$(dirname $STATEFILE)" ] ; then
	echo "Unable to obtain read-write access to $STATEFILE"
	exit 1
fi

[ ! -d "$(dirname $STATEFILE)" ] && mkdir -p "$(dirname $STATEFILE)"
[ ! -f "$STATEFILE" ] && echo "" > "$STATEFILE"

if [ "$1" == "postdpkg" ]; then
	if [ -s "$STATEFILE" ]; then
		readarray -t STATEARRAY < "$STATEFILE"

		ALLUPDATED=true

		for i in "${STATEARRAY[@]}"; do
			PACKAGE=$(echo "$i" | awk -F'/' '{print $1}')
			[ -z "$PACKAGE" ] && continue

			NEWVERSION=$(echo "$i" | awk '{print $2}')
			CURVERSION=$(dpkg -s "$PACKAGE" | grep '^Version:' | awk '{print $2}')

			if [ "$NEWVERSION" != "$CURVERSION" ]; then
				ALLUPDATED=false
				break
			fi
		done

		[ "$ALLUPDATED" == "true" ] && echo "" > "$STATEFILE"
	fi

	exit 0
fi

OLDSTATE=$(cat "$STATEFILE")
STATE=$(apt list --upgradable 2> /dev/null | awk '{if(NR>1)print}' | awk -F '\[upgradable from' '{print $1}' | awk '{print $1,$2}')

if [ "$OLDSTATE" != "$STATE" ]; then
	if [ -n "$STATE" ]; then
		COUNT=$(echo "$STATE" | wc -l)
		MESSAGE=$([ "$COUNT" -gt 1 ] && echo "There are $COUNT updates available:" || echo "There is 1 update available:")

		/usr/local/bin/telegram-notify --quiet --warning --title "APT Updates @ $(hostname -s)" --text "*$MESSAGE*\n$STATE" --protect
	fi

	echo -e "$STATE" > "$STATEFILE"
fi
