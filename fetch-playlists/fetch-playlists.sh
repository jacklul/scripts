#!/usr/bin/env bash
#
# Fetch playlists for use with xupnpd2
#
# Supports excluding by text match in EXTINF line and adding handlers
# by REGEX match (for when the URL doesn't end with supported extension)
#
# For more info about the handlers see:
#  https://gist.github.com/WolfganP/19da4d736237c86e0c50637b1d124aaa#playlist-structure
#
#
# Configuration directory: /etc/fetch-playlists/
#
# Sample playlists.txt:
# --------------------------------------
# https://iptv-org.github.io/iptv/languages/eng.m3u;iptv-org.github.io/languages
# https://iptv-org.github.io/iptv/languages/pol.m3u;iptv-org.github.io;polish.m3u
# https://iptv-org.github.io/iptv/languages/deu.m3u
# https://iptv-org.github.io/iptv/languages/hun.m3u;;hungarian.m3u
# --------------------------------------
#
# Use ';' to separate extra options in line
# The string after first separator is subdirectory to place the playlist in
# The string after second separator is the target file name to save playlist as
#
#
# Sample playlists_exclude.txt:
# --------------------------------------
# BabyFirst.us;polish.m3u,eng.m3u
# AngelTVEurope.in;polish.m3u,eng.m3u
# CNNInternationalEurope.us;polish.m3u
# LoveNature.ca
# FashionTVEurope.fr
# --------------------------------------
#
# Use ';' to separate extra options in line
# The string after first separator is the list of the playlists the exclusion should affect
#
#
# One exact text match in EXTINF section per line
#
# Sample playlists_handlers.txt:
# --------------------------------------
# \.mpd$;type=mp4 handler=http
# --------------------------------------
#
# Use sed extended regex syntax, test your rule with this command:
# sed -E "/EXTINF/ {N; /YOUR_PATTERN_HERE/ s/\-1 /\-1 YOUR_CONTENT_HERE /}" "/tmp/playlist.m3u"
#
#
# You can also use comments in those .txt files (startin with #)
#
# If you wish to use this with something else than xupnpd2
# then you have to set "MEDIA_ROOT" variable in the configuration
#

#shellcheck disable=SC2155,SC2001

# Support Entware out of the box
if [ -d "/opt/etc/opkg.conf" ]; then
    readonly ETC_DIR="/opt/etc"
else
    readonly ETC_DIR="/etc"
fi

readonly SCRIPT_CONFIG_DIR="$ETC_DIR/fetch-playlists"
readonly SCRIPT_CONFIG="$SCRIPT_CONFIG_DIR/playlists.conf"

PLAYLISTS_FILE="$SCRIPT_CONFIG_DIR/playlists.txt"
EXCLUDE_FILE="$SCRIPT_CONFIG_DIR/playlists_exclude.txt"
HANDLERS_FILE="$SCRIPT_CONFIG_DIR/playlists_handlers.txt"
XUPNPD2_CONFIG_FILE="$ETC_DIR/xupnpd2/xupnpd.cfg"
MEDIA_ROOT=  # directory where to download playlists, it doesn't have to be xupnpd's media root
RESCAN_URL=  # url to visit to trigger rescan
CLEANUP=false  # delete contents of MEDIA_ROOT before running
REMOVE_USELESS=true  # cleanup playlists files by removing useless meta lines
DEFAULT_HANDLER=  # override defaults handler
NO_REMOVE=false  # make exclusions not remove entires
CREATE_DIFFS=false  # create diff files to see what this script did
FORCE_HTTP=false  # force all urls in playlists to use http://
FORCE_HTTPS=false  # force all urls in playlists to use https://

if [ -n "$1" ] && [ -f "$1" ]; then # load config from the argument
    #shellcheck disable=SC1090
    . "$1"
elif [ -f "$SCRIPT_CONFIG" ]; then # load default config
    #shellcheck disable=SC1090
    . "$SCRIPT_CONFIG"
fi

if [ -f "$XUPNPD2_CONFIG_FILE" ]; then
    if [ -z "$MEDIA_ROOT" ]; then
        MEDIA_ROOT="$(grep media_root < "$XUPNPD2_CONFIG_FILE" | cut -d '=' -f 2)"
    fi

    if [ -z "$RESCAN_URL" ]; then
        HTTP_PORT="$(grep http_port < "$XUPNPD2_CONFIG_FILE" | cut -d '=' -f 2)"

        if [ -n "$HTTP_PORT" ]; then
            RESCAN_URL="http://127.0.0.1:$HTTP_PORT/scripts/scan.lua"
        fi
    fi
fi

[ -z "$MEDIA_ROOT" ] && { echo "Media root directory is not set" >&2; exit 1; }

if [ -f "$PLAYLISTS_FILE" ]; then
    if [ "$FORCE_HTTP" = "true" ] && [ "$FORCE_HTTPS" = "true" ]; then
        echo "You can only use either FORCE_HTTP or FORCE_HTTPS" >&2
        exit 1
    fi

    DOWNLOAD_START="$(date "+%Y-%m-%d %H:%M")"

    if [ "$CLEANUP" = true ] && [ -d "$MEDIA_ROOT" ]; then
        echo "Cleaning up media directory..."

        #shellcheck disable=SC2115
        rm -fr "${MEDIA_ROOT:?}"/*
    fi

    [ ! -d "$MEDIA_ROOT" ] && mkdir -vp "$MEDIA_ROOT"

    echo "Downloading playlists..."

    while IFS="" read -r PLAYLIST || [ -n "$PLAYLIST" ]; do
        [ "$(echo "$PLAYLIST" | cut -c1-1)" = "#" ] && continue
        [ -z "$PLAYLIST" ] && continue

        SUBDIR=""
        FILENAME=""

        if echo "$PLAYLIST" | grep -q ";"; then
            SUBDIR="$(echo "$PLAYLIST" | cut -d ';' -f 2)"
            FILENAME="$(echo "$PLAYLIST" | cut -d ';' -f 3)"
            PLAYLIST="$(echo "$PLAYLIST" | cut -d ';' -f 1)"
        fi

        PLAYLIST="$(echo "$PLAYLIST" | sed -e "s/\n;\r//")"

        if [ -n "$FILENAME" ]; then
            BASENAME="$FILENAME"
        else
            BASENAME="$(basename "$PLAYLIST")"
        fi

        echo "Downloading: $PLAYLIST"

        if curl -fsSL "$PLAYLIST" -o "/tmp/$BASENAME"; then
            [ "$FORCE_HTTP" = true ] && sed -i 's/https:/http:/' "/tmp/$BASENAME"
            [ "$FORCE_HTTPS" = true ] && sed -i 's/http:/https:/' "/tmp/$BASENAME"

            DESTINATION="$MEDIA_ROOT/$BASENAME"

            if [ -n "$SUBDIR" ]; then
                [ ! -d "$MEDIA_ROOT/$SUBDIR" ] && mkdir -vp "$MEDIA_ROOT/$SUBDIR"
                DESTINATION="$MEDIA_ROOT/$SUBDIR/$BASENAME"
            fi

            mv -f "/tmp/$BASENAME" "$DESTINATION"
            [ "$CREATE_DIFFS" = true ] && cp "$DESTINATION" "$DESTINATION.tmp"
        else
            echo "Failed to download: $PLAYLIST"
        fi
    done < "$PLAYLISTS_FILE"

    if [ "$REMOVE_USELESS" = true ]; then
        echo "Removing useless lines..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."
            sed '/^#EXTVLCOPT/d' -i "$FILE"
        done
    fi

    if [ -f "$EXCLUDE_FILE" ]; then
        echo "Removing excluded entries..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."

            while IFS="" read -r EXCLUSION || [ -n "$EXCLUSION" ]; do
                EXCLUSION="$(echo "$EXCLUSION" | awk '{$1=$1};1')"

                [ "$(echo "$EXCLUSION" | cut -c1-1)" = "#" ] && continue
                [ -z "$EXCLUSION" ] && continue

                if echo "$EXCLUSION" | grep -q ";"; then
                    FILES="$(echo "$EXCLUSION" | cut -d ';' -f 2)"
                    FOUND=false

                    OLDIFS=$IFS
                    IFS=","
                    for FILES_ITEM in $FILES; do
                        if echo "$FILE" | grep -q "$FILES_ITEM"; then
                            FOUND=true
                            break
                        fi
                    done
                    IFS=$OLDIFS

                    [ "$FOUND" = false ] && continue

                    EXCLUSION="$(echo "$EXCLUSION" | cut -d ';' -f 1)"
                fi

                echo "Processing exclusion: $EXCLUSION"

                EXCLUSION="$(echo "$EXCLUSION" | sed -e "s/\n;\r//")"
                PATTERN=$(printf "%s\n" "$EXCLUSION" | sed 's/[]\/$*.^&[]/\\&/g')

                if [ "$NO_REMOVE" = false ]; then
                    sed "/#.*$PATTERN/,+1d" -i "$FILE"
                else
                    sed "/$PATTERN/{N;s/.*\n.*/\\n/}" -i "$FILE"
                fi
            done < "$EXCLUDE_FILE"
        done
    fi

    if [ -f "$HANDLERS_FILE" ]; then
        echo "Inserting handlers..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."

            while IFS="" read -r HANDLER || [ -n "$HANDLER" ]; do
                HANDLER="$(echo "$HANDLER" | awk '{$1=$1};1')"

                [ "$(echo "$HANDLER" | cut -c1-1)" = "#" ] && continue
                [ -z "$HANDLER" ] && continue

                HANDLER="$(echo "$HANDLER" | sed -e "s/\n;\r//")"
                PATTERN="$(echo "$HANDLER" | cut -d ';' -f 1)"
                CONTENT="$(echo "$HANDLER" | cut -d ';' -f 2 | sed 's/[]\/$*.^&[]/\\&/g')"

                echo "Processing pattern: $PATTERN"

                sed -E "/EXTINF.*?\-1 tvg/ {N; /$PATTERN/ s/\-1 /\-1 $CONTENT /}" -i "$FILE"
            done < "$HANDLERS_FILE"
        done
    fi

    if [ -n "$DEFAULT_HANDLER" ]; then
        echo "Setting default handler..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."

            while IFS="" read -r HANDLER || [ -n "$HANDLER" ]; do
                HANDLER="$(echo "$HANDLER" | sed -e "s/\n;\r//")"
                PATTERN="$(echo "$HANDLER" | cut -d ';' -f 1)"
                CONTENT="$(echo "$HANDLER" | cut -d ';' -f 2 | sed 's/[]\/$*.^&[]/\\&/g')"

                sed "s/\-1 tvg/\-1 handler=$DEFAULT_HANDLER tvg/" -i "$FILE"
            done < "$HANDLERS_FILE"
        done
    fi

    if [ "$CREATE_DIFFS" = true ]; then
        echo "Creating diffs..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."

            diff "$FILE.tmp" "$FILE" | grep '^<' | cut -c3- > "$FILE.diff"
            rm "$FILE.tmp"
        done
    fi

    if [ -n "$RESCAN_URL" ]; then
        echo "Forcing media rescan..."

        curl -fsL "$RESCAN_URL" > /dev/null
    fi

    echo "Finished"
else
    echo "Playlists file not found: $PLAYLISTS_FILE" >&2
    exit 1
fi
