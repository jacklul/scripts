#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/lighttpd-pihole-admin-nofastcgi.sh
#
# This script creates config that does NOT start fastcgi server.
#
# If you host other stuff using fastcgi-php mod in addition to
# Pi-hole you end up with two fastcgi server instances.
#
# Run this script once as root to install.

CONF_BASE="/etc/lighttpd/conf-available/15-pihole-admin.conf"
CONF_NEW="/etc/lighttpd/conf-available/15-pihole-admin-nofastcgi.conf"

if [ "$UID" -eq 0 ]; then
    set -e
    echo "# Remove fastcgi.server directive from $(basename "$CONF_BASE")" > "$CONF_NEW"
    echo "include_shell \"$(readlink -f "$0")\"" >> "$CONF_NEW"

    lighty-disable-mod pihole-admin > /dev/null
    lighty-enable-mod pihole-admin-nofastcgi > /dev/null
fi

CONF_DATA="$(cat "$CONF_BASE")"

MATCH_START=$(echo "$CONF_DATA" | awk '/fastcgi.server/{ print NR; exit }')
MATCH_END=$(echo "$CONF_DATA" | tail -n "+$MATCH_START" | awk '/^    )/{ print NR; exit }' | head -n 1)
MATCH_END=$((MATCH_START+MATCH_END))

echo "$CONF_DATA" | head -n $((MATCH_START-1))
echo "    # fastcgi directive was here"
echo "$CONF_DATA" | tail -n "+$((MATCH_END))"
