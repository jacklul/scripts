#!/bin/bash
# Uptime: 3 days, 5 hours, 24 minutes
# Memory: Total: 480MB, Used: 144MB, Free: 158MB
# System space: Total: 5.0GB, Used: 1.5GB, Free: 3.2GB
# Data space: Total: 4.0GB, Used: 116MB, Free: 3.6GB
# Temperature: 44.4ºC

uptime="$(uptime | awk -F'( |,|:)+' '{d=h=m=0; if ($7=="min") m=$6; else {if ($7~/^day/) {d=$6;h=$8;m=$9} else {h=$6;m=$7}}} {print d+0,"days,",h+0,"hours,",m+0,"minutes"}')"
memory="$(free -m | awk 'NR==2 { printf "Total: %sMB, Used: %sMB, Free: %sMB",$2,$3,$4; }')"
system="$(df -h / | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')"
data="$(df -h /data | awk 'NR==2 { printf "Total: %sB, Used: %sB, Free: %sB",$2,$3,$4; }')"
temperature="$(/opt/vc/bin/vcgencmd measure_temp | cut -c "6-9")ºC"

echo -e "Uptime: $uptime\nMemory: $memory\nSystem space: $system\nData space: $data\nTemperature: $temperature\n"
