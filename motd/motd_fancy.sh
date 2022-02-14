#!/bin/bash
# ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
# ┃                                                                              ┃
# ┃                              Welcome back, pi!                               ┃
# ┃                      Monday, 14 February 2022, 08:14:53                      ┃
# ┃                                                                              ┃
# ┃  Last Login....: None                                                        ┃
# ┃  Uptime........: 0 days, 0 hours, 52 minutes (14-02-2022 07:22:29)           ┃
# ┃  Load average..: 0.11 0.10 0.13                                              ┃
# ┃  Memory........: Total: 1477MB, Used: 58MB, Free: 1173MB                     ┃
# ┃  System space..: Total: 100.0GB, Used: 25.0GB, Free: 71.7GB                  ┃
# ┃  Data space....: Total: 100.0GB, Used: 335MB, Free: 98.2GB                   ┃
# ┃  Temperature...: 69.0ºC                                                      ┃
# ┃                                                                              ┃
# ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

clear
stty -echo

function color (){
  echo "\e[$1m$2\e[0m"
}

function extend (){
  local str="$1"
  let spaces=60-${#1}
  while [ $spaces -gt 0 ]; do
    str="$str "
    let spaces=spaces-1
  done
  echo "$str"
}

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
greetingsColor=91
statsLabelColor=93

borderLine="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
borderTopLine=$(color $borderColor "┏$borderLine┓")
borderBottomLine=$(color $borderColor "┗$borderLine┛")
borderBar=$(color $borderColor "┃")
borderEmptyLine="$borderBar                                                                              $borderBar"

me=$(whoami)

# Greetings
greetings="$borderBar$(color $greetingsColor "$(center "Welcome back, $me!")")$borderBar\n"
greetings="$greetings$borderBar$(color $greetingsColor "$(center "$(date +"%A, %d %B %Y, %T")")")$borderBar"

# System information
read loginFrom loginIP loginDate <<< $(last $me --time-format iso -2 | awk 'NR==2 { print $2,$3,$4 }')

# TTY login
if [[ $loginDate == - ]]; then
  loginDate=$loginIP
  loginIP=$loginFrom
fi

if [[ $loginDate == *T* ]]; then
  login="$(date -d $loginDate +"%A, %d %B %Y, %T") ($loginIP)"
else
  # Not enough logins
  login="None"
fi

label_lastlogin="$(extend "$login")"
label_lastlogin="$borderBar  $(color $statsLabelColor "Last Login....:") $label_lastlogin$borderBar"

uptime="$(sec2time $(cut -d "." -f 1 /proc/uptime))"
uptime="$uptime ($(date -d "@"$(grep btime /proc/stat | cut -d " " -f 2) +"%d-%m-%Y %H:%M:%S"))"

label_uptime="$(extend "$uptime")"
label_uptime="$borderBar  $(color $statsLabelColor "Uptime........:") $label_uptime$borderBar"

load="$(cut -d " " -f 1-3 /proc/loadavg)"

label_load="$(extend "$load")"
label_load="$borderBar  $(color $statsLabelColor "Load average..:") $label_load$borderBar"

label_memory="$(extend "$(free -m | awk 'NR==2 { printf "Total: %sMB, Used: %sMB, Free: %sMB",$2,$3,$4; }')")"
label_memory="$borderBar  $(color $statsLabelColor "Memory........:") $label_memory$borderBar"

label_systemspace="$(extend "$(df -h / | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')")"
label_systemspace="$borderBar  $(color $statsLabelColor "System space..:") $label_systemspace$borderBar"

label_dataspace="$(extend "$(df -h /data | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')")"
label_dataspace="$borderBar  $(color $statsLabelColor "Data space....:") $label_dataspace$borderBar"

label_temperature="$(extend "$(/opt/vc/bin/vcgencmd measure_temp | cut -c "6-9")ºC")"
label_temperature="$borderBar  $(color $statsLabelColor "Temperature...:") $label_temperature$borderBar"

stats="$label_lastlogin\n$label_uptime\n$label_load\n$label_memory\n$label_systemspace\n$label_dataspace\n$label_temperature"

# Print motd
echo -e "$borderTopLine\n$borderEmptyLine\n$greetings\n$borderEmptyLine\n$stats\n$borderEmptyLine\n$borderBottomLine"
stty echo
