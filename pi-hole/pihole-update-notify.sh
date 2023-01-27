#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-update-notify.sh
#
# This sends update notification about new Pi-hole updates
#
# Ideally you should create a dedicated timer and service for this
# and disable "updatechecker" cron entries in /etc/cron.d/pihole
# but you can also just use cron for this:
#  @hourly /opt/helpers/pihole-update-notify.sh
# OR
# Override pihole-updatechecker.service:
#  [Service]
#  ExecStartPost=/opt/helpers/pihole-update-notify.sh

STATEFILE=/etc/pihole/update-notify.state

if ([ -f "$STATEFILE" ] && [ ! -w "$STATEFILE" ]) || [ ! -w "$(dirname $STATEFILE)" ] ; then
	echo "Unable to obtain read-write access to $STATEFILE"
	exit 1
fi

if [ ! -d "$(dirname $STATEFILE)" ] ; then
	mkdir -p $(dirname $STATEFILE)
fi

if [ ! -f "$STATEFILE" ] ; then
	echo "$(pihole -v -c | awk '{print $5}')" > "$STATEFILE"
fi

OLDSTATE=`cat "$STATEFILE"`
CURRENT=$(pihole -v -c | awk '{print $5}' | sed 's/\.$//g')
STATE=$(pihole -v -l | awk '{print $5}')

if echo $STATE | grep -q "Invalid Option\|\-v" ; then
	echo 'Invalid output - unable to parse'
	exit 1
fi

if [ "$OLDSTATE" != "$STATE" ]; then
	if [ "$CURRENT" != "$STATE" ]; then
		PRINT=$(diff --new-line-format="%L" --old-line-format="" --unchanged-line-format="" <( pihole -v -c | awk '{print $2 ": " $5}' ) <( pihole -v -l | awk '{print $2 ": " $5}' ))
		COUNT=$(echo "$PRINT" | wc -l)
		MESSAGE=$([ "$COUNT" -gt 1 ] && echo "There are Pi-hole updates available:" || echo "There is Pi-hole update available:")

		/usr/local/bin/telegram-notify --quiet --warning --title "Pi-hole Updates @ $(hostname -f)" --text "*$MESSAGE*\n$PRINT" --protect
	fi

	echo -e "$STATE" > "$STATEFILE"
fi