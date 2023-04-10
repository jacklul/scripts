#!/bin/bash
# /etc/profile.d/motd.sh
#
# ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
# ┃                                                                              ┃
# ┃                              Welcome back, pi!                               ┃
# ┃                     Thursday, 26 January 2023, 11:43:07                      ┃
# ┃                                                                              ┃
# ┃  Last login....: Unknown                                                     ┃
# ┃  Uptime........: 0 days, 0 hours, 18 minutes (26-01-2023 11:24:58)           ┃
# ┃  Load average..: 0.00 0.05 0.09 (82 processes running)                       ┃
# ┃  Memory........: Total: 477MB, Used: 58MB, Free: 144MB                       ┃
# ┃  System space..: Total: 6.0GB, Used: 2.0GB, Free: 3.8GB                      ┃
# ┃  Data space....: Total: 8.0GB, Used: 532MB, Free: 7.0GB                      ┃
# ┃  Temperature...: 42.2ºC                                                      ┃
# ┃  APT updates...: 2 packages                                                  ┃
# ┃                                                                              ┃
# ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
#
# You will want to add this to cron to display number of APT updates:
#  @hourly echo "$(apt list --upgradable 2> /dev/null | awk '{if(NR>1)print}' | awk -F '\[upgradable from' '{print $1}' | awk '{print $1,$2}')" > /var/lib/apt/update-notify.state
#

stty -echo

function color (){
  echo "\e[$1m$2\e[0m"
}

function extend (){
  local str="${1:0:58}"
  let spaces=60-${#str}
  while [ $spaces -gt 0 ]; do
    str="$str "
    let spaces=spaces-1
  done
  echo "$str"
}

#shellcheck disable=SC1073,SC1036,SC1056,SC1072,SC1009
function center (){
  local str="$1"
  let spacesLeft=(78-${#1})/2
  let spacesRight=78-spacesLeft-${#1}
  while [ $spacesLeft -gt 0 ]; do
    str=" $str"
    let spacesLeft=spacesLeft-1
  done

  while [ $spacesRight -gt 0 ]; do
    str="$str "
    let spacesRight=spacesRight-1
  done

  echo "$str"
}

function sec2time (){
  local input=$1

  if [ $input -lt 60 ]; then
    echo "$input seconds"
  else
    ((days=input/86400))
    ((input=input%86400))
    ((hours=input/3600))
    ((input=input%3600))
    ((mins=input/60))

    local daysPlural="s"
    local hoursPlural="s"
    local minsPlural="s"

    if [ $days -eq 1 ]; then
      daysPlural=""
    fi

    if [ $hours -eq 1 ]; then
      hoursPlural=""
    fi

    if [ $mins -eq 1 ]; then
      minsPlural=""
    fi

    echo "$days day$daysPlural, $hours hour$hoursPlural, $mins minute$minsPlural"
  fi
}

borderColor=96
greetingsColor=92
datetimeColor=91
statsLabelColor=93
statsDotsColor=90

borderLine="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
borderTopLine=$(color $borderColor "┏$borderLine┓")
borderBottomLine=$(color $borderColor "┗$borderLine┛")
borderBar=$(color $borderColor "┃")
borderEmptyLine="$borderBar                                                                              $borderBar"

me=$(whoami)

greetings="$borderBar$(color $greetingsColor "$(center "Welcome back, $me!")")$borderBar\n"
greetings="$greetings$borderBar$(color $datetimeColor "$(center "$(date +"%A, %d %B %Y, %T")")")$borderBar"

read loginFrom loginIP loginDate <<< $(last $me --time-format iso -2 | awk 'NR==2 { print $2,$3,$4 }')

if [[ $loginDate == - ]]; then
  loginDate=$loginIP
  loginIP=$loginFrom
fi

if [[ $loginDate == *T* ]]; then
  login="$(date -d $loginDate +"%A, %d %B %Y, %T") ($loginIP)"
else
  login="Unknown"
fi

label_lastlogin="$(extend "${login}")"
label_lastlogin="$borderBar  $(color $statsLabelColor "Last login")$(color $statsDotsColor "....")$(color $statsLabelColor ":") $label_lastlogin$borderBar"

uptime="$(sec2time $(cut -d "." -f 1 /proc/uptime))"
uptime="$uptime ($(date -d "@"$(grep btime /proc/stat | cut -d " " -f 2) +"%d-%m-%Y %H:%M:%S"))"

label_uptime="$(extend "$uptime")"
label_uptime="$borderBar  $(color $statsLabelColor "Uptime")$(color $statsDotsColor "........")$(color $statsLabelColor ":") $label_uptime$borderBar"

load="$(cut -d " " -f 1-3 /proc/loadavg) ($(($(ps -e | wc -l)-1)) processes running)"

label_load="$(extend "$load")"
label_load="$borderBar  $(color $statsLabelColor "Load average")$(color $statsDotsColor "..")$(color $statsLabelColor ":") $label_load$borderBar"

label_memory="$(extend "$(free -m | awk 'NR==2 { printf "Total: %sMB, Used: %sMB, Free: %sMB",$2,$3,$4; }')")"
label_memory="$borderBar  $(color $statsLabelColor "Memory")$(color $statsDotsColor "........")$(color $statsLabelColor ":") $label_memory$borderBar"

label_systemspace="$(extend "$(df -h / | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')")"
label_systemspace="$borderBar  $(color $statsLabelColor "System space")$(color $statsDotsColor "..")$(color $statsLabelColor ":") $label_systemspace$borderBar"

stats="$label_lastlogin\n$label_uptime\n$label_load\n$label_memory\n$label_systemspace"

if mountpoint -q /data; then
  label_dataspace="$(extend "$(df -h /data | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')")"
  label_dataspace="$borderBar  $(color $statsLabelColor "Data space")$(color $statsDotsColor "....")$(color $statsLabelColor ":") $label_dataspace$borderBar"
  stats="$stats\n$label_dataspace"
fi

if [ -f "/opt/vc/bin/vcgencmd" ]; then
  label_temperature="$(extend "$(/opt/vc/bin/vcgencmd measure_temp | cut -c "6-9")ºC")"
  label_temperature="$borderBar  $(color $statsLabelColor "Temperature")$(color $statsDotsColor "...")$(color $statsLabelColor ":") $label_temperature$borderBar"
  stats="$stats\n$label_temperature"
fi

APT_NOTIFY_STATEFILE=/var/lib/apt/update-notify.state

if [ -f "$APT_NOTIFY_STATEFILE" ]; then
  COUNT=$(cat $APT_NOTIFY_STATEFILE | grep "\S" | wc -l)
  label_updates="$(extend "$([ $COUNT -gt 0 ] && ([ $COUNT -gt 1 ] && echo "$COUNT packages" || echo "$COUNT package") || echo "None")")"
  label_updates="$borderBar  $(color $statsLabelColor "APT updates")$(color $statsDotsColor "...")$(color $statsLabelColor ":") $label_updates$borderBar"
  stats="$stats\n$label_updates"
fi

# Print it all out
clear
echo -e "$borderTopLine\n$borderEmptyLine\n$greetings\n$borderEmptyLine\n$stats\n$borderEmptyLine\n$borderBottomLine"
stty echo
