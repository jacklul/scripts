# updatenotifier

Extremely simple update notifier for various stuff.

## Requirements

- systemd

## Installation

**This script installs into `/usr/local/sbin`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root
- Checkout [checkers](checkers/) and [notifiers](notifiers/) directories for examples

By default the script runs everyday at 6AM, you can change this by overriding [timer file](https://www.freedesktop.org/software/systemd/man/systemd.timer.html) - `systemctl edit updatenotifier.timer`.

Checkers and notifiers are placed in `/etc/updatenotifier/checkers` and `/etc/updatenotifier/notifiers` directories respectively.
