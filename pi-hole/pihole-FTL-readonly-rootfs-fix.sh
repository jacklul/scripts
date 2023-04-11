#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-FTL-readonly-rootfs-fix.sh
#
# This fixed some issues before developers moved pihole-FTL startup to systemd service
#
# Override pihole-FTL.service:
#  [Service]
#  ExecStartPre=/opt/helpers/pihole-FTL-readonly-rootfs-fix.sh start
#  ExecStop=/opt/helpers/pihole-FTL-readonly-rootfs-fix.sh stop

if [ "$1" = "start" ]; then
	if ! mount | grep /usr/bin/pihole-FTL > /dev/null && [ "$(mount | sed -n -e "s/^\/dev\/.* on \/ .*(\(r[w|o]\).*/\1/p")" = "ro" ]; then
		echo "Read only rootfs detected, copying and binding pihole-FTL binary..."

		mkdir -pv /mnt/pihole-FTL && mount tmpfs -v -t tmpfs -o mode=644,size=$(($(wc -c < /usr/bin/pihole-FTL || echo 100M)+1000000)) /mnt/pihole-FTL
		cp -fpv /usr/bin/pihole-FTL /mnt/pihole-FTL && mount -v -o bind /mnt/pihole-FTL/pihole-FTL /usr/bin/pihole-FTL
	fi
elif [ "$1" = "stop" ]; then
	mount | grep /usr/bin/pihole-FTL > /dev/null && umount -v /usr/bin/pihole-FTL
	mount | grep /mnt/pihole-FTL > /dev/null && umount -v /mnt/pihole-FTL && rmdir -v /mnt/pihole-FTL
elif [ "$1" != "" ]; then
	echo "Invalid argument: $1"
fi
