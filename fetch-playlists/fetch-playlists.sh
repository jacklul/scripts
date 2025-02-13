#!/bin/sh
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

#shellcheck disable=SC2155

readonly SCRIPT_PATH="$(readlink -f "$0")"
readonly SCRIPT_NAME="$(basename "$SCRIPT_PATH" .sh)"
readonly SCRIPT_CONFIG_DIR="/etc/fetch-playlists"
readonly SCRIPT_CONFIG="$SCRIPT_CONFIG_DIR/playlists.conf"

PLAYLISTS_FILE="$SCRIPT_CONFIG_DIR/playlists.txt"
EXCLUDE_FILE="$SCRIPT_CONFIG_DIR/playlists_exclude.txt"
HANDLERS_FILE="$SCRIPT_CONFIG_DIR/playlists_handlers.txt"
XUPNPD2_CONFIG_FILE="/etc/xupnpd2/xupnpd2.cfg"
MEDIA_ROOT=
RESCAN_URL=
CLEANUP=false
REMOVE_USELESS=true
DEFAULT_HANDLER=
NO_REMOVE=false
CREATE_DIFFS=false
FORCE_HTTP=false
FORCE_HTTPS=false

if [ -n "$1" ] && [ -f "$1" ]; then # load config from the argument
    #shellcheck disable=SC1090
    . "$1"
elif [ -f "$SCRIPT_CONFIG" ]; then # load default config
    #shellcheck disable=SC1090
    . "$SCRIPT_CONFIG"
fi

IS_INTERACTIVE=$([ "$(readlink -f /proc/$$/fd/0)" = "/dev/null" ] && echo false || echo true)

logprint() {
    if [ "$IS_INTERACTIVE" = false ]; then
        logger -st "$SCRIPT_NAME" "$1"
    else
        echo "$1"
    fi
}

if [ -f "$XUPNPD2_CONFIG_FILE" ]; then
    HTTP_PORT="$(grep http_port < "$XUPNPD2_CONFIG_FILE" | cut -d '=' -f 2)"
    MEDIA_ROOT="$(grep media_root < "$XUPNPD2_CONFIG_FILE" | cut -d '=' -f 2)"

    if [ -z "$RESCAN_URL" ] && [ -n "$HTTP_PORT" ]; then
        RESCAN_URL="http://127.0.0.1:$HTTP_PORT/scripts/scan.lua"
    fi
fi

[ -z "$MEDIA_ROOT" ] && { logprint "Media root directory is not set"; exit 1; }

if [ -f "$PLAYLISTS_FILE" ]; then
    if [ "$FORCE_HTTP" = "true" ] && [ "$FORCE_HTTPS" = "true" ]; then
        logprint "You can only use either FORCE_HTTP or FORCE_HTTPS"
        exit 1
    fi

    DOWNLOAD_START="$(date "+%Y-%m-%d %H:%M")"

    if [ "$CLEANUP" = true ] && [ -d "$MEDIA_ROOT" ]; then
        logprint "Cleaning up media directory..."

        #shellcheck disable=SC2115
        rm -fr "$MEDIA_ROOT"/*
    fi

    [ ! -d "$MEDIA_ROOT" ] && mkdir -vp "$MEDIA_ROOT"

    logprint "Downloading playlists..."

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
            logprint "Failed to download: $PLAYLIST"
        fi
    done < "$PLAYLISTS_FILE"

    if [ "$REMOVE_USELESS" = true ]; then
        logprint "Removing useless lines..."

        find "$MEDIA_ROOT" -type f \( -name "*.m3u" -o -name "*.m3u8" \) -newermt "$DOWNLOAD_START" | while read -r FILE; do
            echo "Processing file $FILE..."
            sed '/^#EXTVLCOPT/d' -i "$FILE"
        done
    fi

    if [ -f "$EXCLUDE_FILE" ]; then
        logprint "Removing excluded entries..."

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
        logprint "Inserting handlers..."

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
        logprint "Setting default handler..."

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
        logprint "Forcing media rescan..."

        curl -fsL "$RESCAN_URL" > /dev/null
    fi
    
    echo "Finished"
else
    logprint "Playlists file not found: $PLAYLISTS_FILE"
    exit 1
fi
