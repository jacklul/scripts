#!/usr/bin/env bash

php "$(dirname "$0")/rclone-dry-log-tree.php" "/tmp/rclone.log"
read -rp "Press Enter to continue..."
