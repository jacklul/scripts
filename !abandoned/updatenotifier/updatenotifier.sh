#!/bin/bash
# Made by Jack'lul <jacklul.github.io>

[ "$UID" -eq 0 ] || { echo "This script must run as root!"; exit 1; }

CONFIG_DIR=/etc/updatenotifier
CONFIG_FILE=${CONFIG_DIR}/updatenotifier/updatenotifier.conf
CHECKERS_PATH=${CONFIG_DIR}/checkers
NOTIFIERS_PATH=${CONFIG_DIR}/notifiers
STATE_PATH=/var/lib/updatenotifier
LOCKFILE=/var/lock/$(basename $0)

if [ -f "${CONFIG_FILE}" ]; then
	. ${CONFIG_FILE}
fi

LOCKPID=$(cat ${LOCKFILE} 2> /dev/null || echo '')
if [ -e ${LOCKFILE} ] && [ ! -z "$LOCKPID" ] && kill -0 $LOCKPID > /dev/null 2>&1; then
    echo "Script is already running!"
    exit 6
fi

echo $$ > ${LOCKFILE}

function process_unlock() {
	rm -f "$LOCKFILE" >/dev/null 2>&1
	rm -f "/tmp/updatenotifier_recent_check" >/dev/null 2>&1
}

INTERRUPT_FUNCTIONS=('process_unlock')
function onInterruptOrExit() {
	for FUNC in ${INTERRUPT_FUNCTIONS[*]}; do
		$FUNC
	done
}
trap onInterruptOrExit EXIT

function addNotification() {
	local NOTIFICATION=$1

	if [ "$NOTIFICATIONS" != "" ]; then
		NOTIFICATIONS+="\n\n"
	fi

	NOTIFICATIONS+="${RESULT}"
}

function saveState() {
	NAME=$1
	CONTENTS=$2

	if [ "$NAME" != "" ]; then
		echo -e "$CONTENTS" > "$STATE_PATH/${NAME}.last.new"
	fi
}

function commitStates() {
	if [ -z "$(ls -A $STATE_PATH)" ]; then
		return
	fi

	for FILE in $STATE_PATH/*.new
	do
		if [ ! -f "$FILE" ]; then
			continue
		fi

		BASENAME=$(basename $FILE .new)

		mv $FILE $STATE_PATH/$BASENAME
	done
}

function runChecker() {
	FILE=$(basename $1)
	NAME=$FILE

	if [ ! -f "$CHECKERS_PATH/$FILE" ]; then
		if [ ! -f "$CHECKERS_PATH/${FILE}.sh" ]; then
			echo "File does not exist: $CHECKERS_PATH/$FILE"
			exit 1
		else
			FILE+=.sh
		fi
	fi

	unset -f process
	. $CHECKERS_PATH/$FILE

	if [ "$(type -t process)" == "function" ]; then
		[ "$NAME" != "" ] && printf " $NAME..."

		RESULT=$(process)
		if [ "$RESULT" != "" ]; then
			if [ ! -f "$STATE_PATH/${FILE}.last" ] || [ "$RESULT" != "$(cat $STATE_PATH/${FILE}.last)" ]; then
				addNotification "$RESULT"
				saveState "$FILE" "$RESULT"
			fi
			
			printf " \uff01\n"
		else
			rm -f "$STATE_PATH/${FILE}.last"
			
			printf " \u2713\n"
		fi
	fi
}

function runCheckers() {
	if [ -z "$(ls -A $CHECKERS_PATH)" ]; then
		return
	fi

	mkdir -p $STATE_PATH

	for FILE in $CHECKERS_PATH/*
	do
		if [ ! -f "$FILE" ]; then
			continue
		fi

		runChecker $FILE
	done
}

function runNotifiers() {
	if [ -z "$(ls -A $NOTIFIERS_PATH)" ]; then
		return
	fi

	local NOTIFICATIONS=$1

	for FILE in $NOTIFIERS_PATH/*
	do
		if [ ! -f "$FILE" ]; then
			continue
		fi

		NAME=$(basename $FILE)

		unset -f notify
		. $FILE

		[ "$NAME" != "" ] && printf " $NAME..."

		if [ "$(type -t notify)" == "function" ]; then
			RESULT=$(notify "$NOTIFICATIONS")
			[ "$NAME" != "" ] && printf " \u2713\n"
			echo -e "$RESULT"
		else
			[ "$NAME" != "" ] && printf " \u2717\n"
		fi
	done
}

if systemctl is-active --quiet updatenotifier.service ; then
	touch -d '-10 minutes' "/tmp/updatenotifier_recent_check"

	if [ "/tmp/updatenotifier_recent_check" -ot "$STATE_PATH/last" ]; then
		echo "Task executed recently, ignoring!"
		exit
	fi

	touch "$STATE_PATH/last"
fi

printf "Checking for updates:\n"

renice -n 19 $$ > /dev/null

NOTIFICATIONS=

if [ "$1" != "" ]; then
	runChecker $1
else
	runCheckers
fi

if [ "$NOTIFICATIONS" != "" ]; then
	printf "\nSending notifications:\n"
	runNotifiers "$NOTIFICATIONS"
else
	printf "\nNothing to notify about.\n"
fi

commitStates

if systemctl is-active --quiet updatenotifier.service ; then
	echo "$NOTIFICATIONS" | sed '/^[[:space:]]*$/d' | awk '{$1=$1;print}' > "$STATE_PATH/last"
fi
