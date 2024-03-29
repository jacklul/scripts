#!/bin/bash

# -------------------------------------------------------
#   Update checker
# -------------------------------------------------------

VERSION_CHECK_URL="https://github.com/NicolasBernaerts/debian-scripts/blob/master/telegram/telegram-notify?raw=true"
VERSION_CHECK_CACHE=/tmp/telegram-notify-updatecheck.cache
VERSION_CHECK_INTERVAL=720
VERSION_CHECK_LOCAL=$(head -n 100 < "${0}" | sed -n "/Revision history/,/# --/p" | head -n-1 | tail -n+2 | tail -1 | awk '{print $3}')
VERSION_CHECK_LATEST=$([ -f "${VERSION_CHECK_CACHE}" ] && cat ${VERSION_CHECK_CACHE} || echo "${VERSION_CHECK_LOCAL}")

if [ ! -f "${VERSION_CHECK_CACHE}" ] || { [ -w "${VERSION_CHECK_CACHE}" ] && [[ $(find "${VERSION_CHECK_CACHE}" -mmin +${VERSION_CHECK_INTERVAL} -print) ]] ; }; then
    [ "${QUIET}" = "false" ] && echo "[Info] Checking for telegram-notify update..."

    VERSION_CHECK_REMOTE_SCRIPT=$(wget -q -T 10 -O - "${VERSION_CHECK_URL}")
    VERSION_CHECK_LATEST=$(echo "${VERSION_CHECK_REMOTE_SCRIPT}" | sed -n "/Revision history/,/# --/p" | head -n-1 | tail -n+2 | tail -1 | awk '{print $3}')

    if [ "${VERSION_CHECK_LATEST}" != "" ]; then
        echo "${VERSION_CHECK_LATEST}" >> "${VERSION_CHECK_CACHE}"
    else
        echo "${VERSION_CHECK_LOCAL}" >> "${VERSION_CHECK_CACHE}"
    fi
fi

if [ "${TEXT}" != "" ] && [ -f "${VERSION_CHECK_CACHE}" ]; then
    VERSION_CHECK_LATEST=$(cat ${VERSION_CHECK_CACHE})

    if [ "$(echo -e "${VERSION_CHECK_LOCAL}\n${VERSION_CHECK_LATEST}" | sort -r | head -1)" != "${VERSION_CHECK_LOCAL}" ]; then
        [ "${QUIET}" = "false" ] && echo "[Info] New script version (${VERSION_CHECK_LATEST}) is available"

        if [ "${MODE}" = "html" ]; then
            TEXT="${TEXT}${LINE_BREAK}${LINE_BREAK}<i>There is newer version ($(cat ${VERSION_CHECK_CACHE})) of telegram-notify available.</i>"
        else
            TEXT="${TEXT}${LINE_BREAK}${LINE_BREAK}_There is newer version ($(cat ${VERSION_CHECK_CACHE})) of telegram-notify available._"
        fi
    fi
fi
