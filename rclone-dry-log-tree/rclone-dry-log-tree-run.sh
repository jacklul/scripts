#!/usr/bin/env bash

xdg-open "http://127.0.0.1:8000"
php -S 127.0.0.1:8000 "$(dirname "$0")/rclone-dry-log-tree.php"
read -rp "Press Enter to continue..."
