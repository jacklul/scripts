#!/bin/bash

if [ -f "$(dirname $0)/gencert.sh" ]; then
    "$(dirname $0)/gencert.sh" -g -b -n lighttpd -t 365 -f
else
    echo "gencert.sh not found in current directory"
fi
