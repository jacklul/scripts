# dst-reward-links

This script checks [forums.kleientertainment.com](https://forums.kleientertainment.com/) for new [Klei rewards](https://accounts.klei.com/account/rewards) links.

It uses [telegram-notify](/telegram-notify/) script to send the links to the configured Telegram chat.
If you would like to use different delivery method then you will have to modify `notify` function on the top of `dst-reward-links.php` file (some PHP knowledge required).

## Requirements

- systemd
- `php-cli` (tested with 7.3.31)

## Installation

**This script installs into `/home/$USER/.local/bin/`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh`
