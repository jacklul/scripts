@echo off

start "" http://127.0.0.1:8000
php -S 127.0.0.1:8000 "%~dp0rclone-dry-log-tree.php"
@pause
