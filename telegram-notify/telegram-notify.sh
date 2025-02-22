#!/bin/bash
# ---------------------------------------------------
#  Send notification to a telegram account thru a bot account
#  Configuration is stored in /etc/telegram-notify.conf
#  Depends on curl 
#
#  Revision history :
#    10/01/2016, v1.0 - Creation by N. Bernaerts
#    22/01/2016, v1.1 - Handle emoticons
#    06/08/2016, v1.2 - Add API key and User ID parameters
#                       Remove dependency to PERL
#    08/08/2016, v1.3 - Add --document, --html and --silent options
#    10/11/2016, v1.4 - Add --icon option
#    11/01/2018, v1.5 - Add possibility of piped text, idea from Yasir Atabani
#    19/05/2018, v1.6 - Add socks5 proxy option, idea from RangerRU
#    28/06/2018, v1.7 - Add --warning and --config options, idea from Markus Hof
#    08/08/2019, v1.8 - Add --file option (file holding text to display)
#    23/09/2019, v1.9 - Add --quiet option, thanks to Alberto Panu
#    06/02/2020, v2.0 - Add --disable_preview option, thanks to Alex P.
#    30/01/2022, v2.1 - Add --code option and --protect
#    03/05/2022, v2.2 - Bug fixes, thanks to Radius17
#    31/01/2023, v2.3 - Fix for image and document sending, thanks to jacklul
#    01/02/2023, v2.4 - Add --debug and --position option, idea from z3r0l1nk
#    03/02/2023, v2.5 - Add --audio option and code rewrite
# ---------------------------------------------------

# initialise variables
export API_KEY=""
export USER_ID=""
SOCKS_PROXY=""
export RC=1
export DEBUG="false"
DEBUG_KEY="false"
VERBOSE="false"
export TEXT=""
export FILE=""
export ICON=""
export TYPE="text"
export ARR_OPTIONS
MODE="markdown"
DISABLE_PREVIEW="false"
PROTECT="false"
SILENT="false"
QUIET="false"
LINE_BREAK=$'\n'

# Configuration file
FILE_CONF="/etc/telegram-notify.conf"

# -------------------------------------------------------
#   Output and global functions
# -------------------------------------------------------

print_multiline() {
  local _line
  local _target=$1; shift
  local _level=$1; shift

  [ "$_target" -gt 0 ] && [ "$_target" -lt 3 ] || _target=2
  printf "%s %s\n" "$_level" "$1" 1>&"$_target"; shift
  for _line in "${@:1}"; do
    printf "%s +               %s\n" "$_level" "$_line" 1>&"$_target";
  done
}

verbose() { [ "${VERBOSE}" = "true"  ] && print_multiline 2 "[Verbose]" "$@"; }
debug()   { [ "${DEBUG}"   = "true"  ] && print_multiline 2 "[Debug]  " "$@"; }
info()    { [ "${QUIET}"   = "false" ] && print_multiline 1 "[Info]   " "$@"; }
warning() { [ "${QUIET}"   = "false" ] && print_multiline 2 "[Warning]" "$@"; }
error()   { [ "${QUIET}"   = "false" ] && print_multiline 2 "[Error]  " "$@"; }
alert()   {                               print_multiline 2 "[Alert]  " "$@"; } # never suppress alerts

trim() {
  # remove leading whitespace characters
  local _result=$1
  _result="${_result#"${_result%%[![:space:]]*}"}"
  # remove trailing whitespace characters
  _result="${_result%"${_result##*[![:space:]]}"}"
  printf "%s" "$_result"
  return 0
}


# -------------------------------------------------------
#   Check tools availability
# -------------------------------------------------------

command -v curl >/dev/null 2>&1 || { alert "Please install 'curl'"; exit 1; }

# -------------------------------------------------------
#   Unicode icons
# -------------------------------------------------------

get_utf_locale() {
    # and use first one having UTF-8, or current one as fallback
    command -v locale >/dev/null 2>&1 || { error "Please install 'locales'"; return 1; }

    locale -a | while read -er line; do
        local _lang=${line,,}
        local _lc_lang=${_lang,,}
        if [ "${_lc_lang}" != "${_lc_lang/utf/}" ]; then
          printf "%s" "$_lang"
          exit 9
        fi
    done
    [ "$?" -eq 9 ] && exit 0
    printf "%s" "$LANG"
    return 1
}

get_unicode_string() {
    # support unicode input even if current locale has no UTF-8
    local _lang=$LANG;
    local _lc_lang=${LANG,,}
    if [ "${_lc_lang}" = "${_lc_lang/utf/}" ]; then # checking for lower case utf
      # currently no UTF-8 support, checking available locales for UTF-8 support
      _lang=$(get_utf_locale)
    fi
    command -v printf >/dev/null 2>&1 && LANG=$_lang printf "%b\n" "$1" && return 1;
    LANG=$_lang echo -e "$1" && return 0
    return 1
}

# -------------------------------------------------------
#   Load config
# -------------------------------------------------------

read_config() {
  # read config file removing comments
  [ -f "${FILE_CONF}" ] || return 1
  local _config
  _config=$(grep -oE "^[^#]*" "${FILE_CONF}") # read up to first '#' in line

  echo "${_config}" | while read -er _line; do # split on new line
    echo "$_line" | while IFS='=' read -ra _KEY_VALUE; do # split on "="
      local _key
      local _value
      _key=$(trim "${_KEY_VALUE[0]}")
      _value=$(trim "${_KEY_VALUE[1]}")

      # normalize key
      _key=${_key//-/_}
      _key=${_key^^} # upper case

      if [ "$_key" = "$1" ]; then
        if [ "${DEBUG}" = "true" ]; then
          if [ "$_key" = "API_KEY" ]; then # hide API key in debug output
            [ "$_value" = "" ] && debug "Config        : Key='${_key}'; Value=###missing###"
            if [ ! "$_value" = "" ]; then
              [ "$DEBUG_KEY" != "true" ] && debug "Config        : Key='${_key}'; Value=***** (show with --debug_key)"
              [ "$DEBUG_KEY" =  "true" ] && debug "Config        : Key='${_key}'; Value='${_value}'"
            fi
          else
            debug "Config        : Key='${_key}'; Value='${_value}'"
          fi
        fi

        printf "%s" "$_value"
        exit 9
      fi
    done
    [ "$?" = 9 ] && exit 9
  done
  [ "$?" = 9 ] && return 0
  return 1
}

# -------------------------------------------------------
#   Checking result of Telegram API call
# -------------------------------------------------------

read_from_json() {
    # jq fallback: quick'n'dirty and not so save
    verbose "Get value for : $2"
    verbose "JSON          : $1"

    echo "$1" | while IFS=',' read -ra _LINE; do # split by ','
      verbose "Lines         : " "${_LINE[@]}"

      for _segment in "${_LINE[@]}"; do
        verbose "Segment       : ${_segment}"

        echo "$_segment" | while IFS=':' read -ra _KEY_VALUE; do # split by ':'
          verbose "Key/Value     : " "${_KEY_VALUE[@]}"

          local _key="${_KEY_VALUE[0]}"
          local _value
          # remove quotes from key
          _key=${_key//\"/}
          if [ "${#_KEY_VALUE[@]}" -gt 2 ]; then
            _value="${_KEY_VALUE[1]}:${_KEY_VALUE[*]:2}" # all values if value contains ':'; No loop rejoin only first
          else
            _value="${_KEY_VALUE[1]}"
          fi

          [ "$_key" = "$2" ] && printf "%s" "$_value" && exit 9
        done
        [ "$?" = 9 ] && exit 9
      done
      [ "$?" = 9 ] && exit 9
    done
    [ "$?" = 9 ] && return 0
    return 1
}

check_telegram_response() {
    local _jq_mode=0
    command -v jq >/dev/null 2>&1 && _jq_mode=1
    if [ $_jq_mode = 1 ]; then # use jq if available
      debug "Parsing JSON using 'jq'..."
      if [ "$(echo "$1" | jq '.ok')" = 'false' ]; then
        printf "%s (code: %s)" "$(echo "$1" | jq '.description')" "$(echo "$1" | jq '.error_code')"  && return 1
      fi
      debug "Telegram API call with status 'ok'"
      return 0
    else
      warning "Using insecure JSON parser, please install 'jq'"
      local _json=$1
      # remove json wrapper
      _json=${_json//\{/}
      _json=${_json//\}/}

      local _rc=""
      _rc=$(read_from_json "$_json" "ok")

      if [ "$_rc" = 'false' ]; then
        # get error message and code for error message
        local _code=""
        local _msg=""
        _code=$(read_from_json "$_json" "error_code")
        _msg=$(read_from_json "$_json" "description")

        printf "%s (code: %s)" "$_msg" "$_code" && return 1
      fi
      return 0
    fi
    return 1
}

# -------------------------------------------------------
#   Loop to load arguments
# -------------------------------------------------------

# if no argument, display help
if [ $# -eq 0 ] 
then
  echo "Tool to send a message to a Telegram User or Channel."
  echo "Message is sent from a Telegram Bot and can contain icon, text, image and/or document."
  echo "Main parameters are :"
  echo "  --text <text>          Text of the message (use - for piped text)"
  echo "  --file <file>          File holding the text of the message"
  echo "  --photo <file>         Image to display"
  echo "  --document <file>      Document to transfer"
  echo "  --position <lat,long>  GPS position"
  echo "  --audio <file>         Audio file (converted to opus if needed)"
  echo "Options are :"
  echo "  --title <title>     Title of the message (if text message)"
  echo "  --html              Use HTML mode for text content (markdown by default)"
  echo "  --disable_preview   Don't create previews for links, image and/or document"
  echo "  --protect           Protects the contents of the sent message from forwarding and saving"
  echo "  --silent            Send message in silent mode (no user notification on the client)"
  echo "  --quiet             Don't print message to stdout"
  echo "  --config <file>     use alternate config file, instead of default ${FILE_CONF}"
  echo "  --user <user-id>    Recipient User or Channel ID (replaces user-id= in ${FILE_CONF})"
  echo "  --key <api-key>     API Key of your Telegram bot (replaces api-key= in ${FILE_CONF})"
  echo "Optional icons are :"
  echo "  --success           Add a success icon"
  echo "  --warning           Add a warning icon"
  echo "  --error             Add an error icon"
  echo "  --question          Add a question mark icon"
  echo "  --exclamation       Add a red exclamation mark icon"
  echo "  --bug               Add a bug icon"
  echo "  --beetle            Add a beetle icon"
  echo "  --icon <code>       Add an icon by UTF code (ex 1F355)"
  echo "Other options are :"
  echo "  --debug             Display config file and JSON answer for debug"
  echo "  --debug_key         Display config file data with API key for debug"
  echo "  --verbose           Display more details than --debug"
  echo "Here is an example of piped text :"
  echo "  echo 'text to be displayed' | telegram-notify --success --text -"
  exit
fi

# loop to retrieve arguments
while test $# -gt 0
do
  case "$1" in
    "--text") shift; TEXT="$1"; shift; ;;
    "--file") shift; FILE="$1"; shift; ;;
    "--photo") shift; TYPE="pict"; FILE="$1"; shift; ;;
    "--document") shift; TYPE="doc"; FILE="$1"; shift; ;;
    "--audio") shift; TYPE="audio"; FILE="$1"; shift; ;;
    "--position") shift; TYPE="pos"; POSITION="$1"; shift; ;;
    "--title") shift; TITLE="$1"; shift; ;;
    "--html") MODE="html"; shift; ;;
    "--disable_preview") DISABLE_PREVIEW="true"; shift; ;;
    "--protect") PROTECT="true"; shift; ;;
    "--silent") SILENT="true"; shift; ;;
    "--quiet") QUIET="true"; shift; ;;
    "--config") shift; FILE_CONF="$1"; shift; ;;
    "--user") shift; ARG_USER_ID="$1"; shift; ;;
    "--key") shift; ARG_API_KEY="$1"; shift; ;;
    "--success") ICON=$(get_unicode_string "\U2705"); shift; ;;
    "--warning") ICON=$(get_unicode_string "\U26A0"); shift; ;;
    "--error") ICON=$(get_unicode_string "\U1F6A8"); shift; ;;
    "--question") ICON=$(get_unicode_string "\U2753"); shift; ;;
    "--exclamation") ICON=$(get_unicode_string "\U2757"); shift; ;;
    "--bug") ICON=$(get_unicode_string "\U1F41B"); shift; ;;
    "--beetle") ICON=$(get_unicode_string "\U1F41E"); shift; ;;
    "--icon") shift; ICON=$(get_unicode_string "\U$1"); shift; ;;
    "--debug") DEBUG="true"; shift; ;;
    "--debug_key") DEBUG="true"; DEBUG_KEY="true"; shift; ;;
    "--verbose") DEBUG="true"; VERBOSE="true"; shift; ;;
    *) shift; ;;
  esac
done
[ "$VERBOSE" = "true" ] && QUIET="false"

# -------------------------------------------------------
#   Read configuration
# -------------------------------------------------------

# if configuration file is present
if [ -f "${FILE_CONF}" ]
then
	# display used config file
	info "Using configuration file ${FILE_CONF}"

  # use defaults from config
  API_KEY=$(read_config "API_KEY")
  USER_ID=$(read_config "USER_ID")
  SOCKS_PROXY=$(read_config "SOCKS_PROXY")
else
	warning "Configuration file missing ${FILE_CONF}"
fi

# overwrite defaults from config file with more specific command line arguments if provided
[ "${ARG_USER_ID}" != "" ] && USER_ID=${ARG_USER_ID}
[ "${ARG_API_KEY}" != "" ] && API_KEY=${ARG_API_KEY}

# check API key and User ID
[ "${API_KEY}" = "" ] && { alert "Please provide API key or set it in ${FILE_CONF}"; exit 1; }
[ "${USER_ID}" = "" ] && { alert "Please provide User ID or set it in ${FILE_CONF}"; exit 1; }

# Check for file existence
[ "${FILE}" != "" ] && [ ! -f "${FILE}" ] && { error "File ${FILE} doesn't exist"; exit 1; }

# generate temporary directory
TMP_DIR=$(mktemp -t -d "telegram-XXXXXXXX")
TMP_AUDIO="${TMP_DIR}/audio.ogg"

# -------------------------------------------------------
#   Text : space, line break, title and icon
# -------------------------------------------------------

# if text is a file, get its content
[ "${TYPE}" = "text" ] && [ "${FILE}" != "" ] && TEXT=$(cat "${FILE}")

# if text is to be read from pipe, get it
[ ! -t 0 ] && [ "${TEXT}" = "-" ] && TEXT=$(cat)

# convert \n to LF
TEXT="${TEXT//$"\n"/${LINE_BREAK}}"
# remove leading and whitespace characters
TEXT=$(trim "$TEXT")

# if title defined, add it with line break
if [ "${TITLE}" != "" ]; then
  # convert \n to LF and trim
  TITLE="${TITLE//$"\n"/${LINE_BREAK}}"
  TITLE=$(trim "$TITLE")

  [ "${MODE}" = "html" ] && TEXT="<b>${TITLE}</b>${LINE_BREAK}${TEXT}"
  [ "${MODE}" = "markdown" ] && TEXT="*${TITLE}*${LINE_BREAK}${TEXT}"
fi

# if icon defined, include ahead of notification
[ "${ICON}" != "" ] && TEXT="${ICON} ${TEXT}"

# -----------------
#   Notification
# -----------------

# default option
ARR_OPTIONS=( "--silent" "--insecure" )

# if needed, socks5 option
[ "${SOCKS_PROXY}" != "" ] && ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--socks5-hostname" "${SOCKS_PROXY}" )

case "${TYPE}" in

  # text
  "text") 
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--data" "chat_id=${USER_ID}" "--data" "disable_notification=${SILENT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--data" "protect_content=${PROTECT}" "--data" "disable_web_page_preview=${DISABLE_PREVIEW}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--data" "parse_mode=${MODE}" "--data" "text=${TEXT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "https://api.telegram.org/bot${API_KEY}/sendMessage" )
    ;;
    
  # image
  "pict")
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "chat_id=${USER_ID}" "--form" "disable_notification=${SILENT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "protect_content=${PROTECT}" "--form" "disable_web_page_preview=${DISABLE_PREVIEW}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "parse_mode=${MODE}" "--form" "photo=@${FILE}" "--form" "caption=${TEXT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "https://api.telegram.org/bot${API_KEY}/sendPhoto" )
    ;;

  # document
  "doc") 
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "chat_id=${USER_ID}" "--form" "disable_notification=${SILENT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "protect_content=${PROTECT}" "--form" "disable_web_page_preview=${DISABLE_PREVIEW}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "parse_mode=${MODE}" "--form" "document=@${FILE}" "--form" "caption=${TEXT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "https://api.telegram.org/bot${API_KEY}/sendDocument" )
    ;;

  # position
  "pos") 
    # extract coordinates
    LATITUDE=$(echo "${POSITION}" | cut -d',' -f1)
    LONGITUDE=$(echo "${POSITION}" | cut -d',' -f2)

    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "chat_id=${USER_ID}" "--form" "disable_notification=${SILENT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "parse_mode=${MODE}" "--form" "caption=${TEXT}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "latitude=${LATITUDE}" "--form" "longitude=${LONGITUDE}" )
    ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "https://api.telegram.org/bot${API_KEY}/sendLocation" )
    ;;

  # audio
  "audio") 
    # if needed, convert audio file
    IS_OPUS=$(file "${FILE}" | grep "Opus audio")
    command -v ffmpeg >/dev/null 2>&1 && IS_FFMPEG="true"

    [ "${IS_OPUS}" != "" ] && TMP_AUDIO="${FILE}"
    [ "${IS_OPUS}" = "" ] && [ "${IS_FFMPEG}" = "true" ] && ffmpeg -i "${FILE}" -loglevel quiet -c libopus -ab 64k "${TMP_AUDIO}"

    # if proper audio file
    if [ -f "${TMP_AUDIO}" ]
    then
      ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "chat_id=${USER_ID}" "--form" "disable_notification=${SILENT}" )
      ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "--form" "parse_mode=${MODE}" "--form" "voice=@${TMP_AUDIO}" "--form" "caption=${TEXT}" )
      ARR_OPTIONS=( "${ARR_OPTIONS[@]}" "https://api.telegram.org/bot${API_KEY}/sendVoice" )
    else
      ARR_OPTIONS=( )
      error "FFmpeg absent, Opus conversion impossible install 'ffmpeg'"
    fi
    ;;

  *) 
    ARR_OPTIONS=( )
    ;;
esac

# if there is a message to send
if [ ${#ARR_OPTIONS[@]} -gt 0 ]
then
  # send message
  RESULT=$(curl "${ARR_OPTIONS[@]}")

  # if debug mode, display bot answer
  debug "Options       : ${ARR_OPTIONS[*]}"
  debug "TG-API answer : ${RESULT}"

  # checking answer
  RESULT_CHECK=$(check_telegram_response "${RESULT}")
  RC=$?
  [ "$RESULT_CHECK" != "" ] && alert "$(printf "Telegram API failed with: %s\n" "$RESULT_CHECK")"

#  else, nothing, error
else
  RC=2
  error "Nothing to notify (return code: ${RC})"
  
fi

# remove temporary directory
rm -r "${TMP_DIR}"

debug "Return code: ${RC}"
exit $RC