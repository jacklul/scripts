# showRSS

This script checks [showrss.info](https://showrss.info/) feeds for new releases.

It uses [telegram-notify](/telegram-notify/) script to send the notifications to the configured Telegram chat.
If you would like to use different delivery method then you will have to modify `command` variable in the configuration file.

## Requirements

- systemd
- `php-cli` (tested with 7.3.31)

## Installation

**This script installs into `/home/$USER/.local/bin/`.**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/main/showRSS/install.sh | bash
```

OR

- Copy this whole directory and transfer it to the device
- Run `install.sh`

By default the script runs every 10 minutes, you can change this by overriding [timer file](https://www.freedesktop.org/software/systemd/man/systemd.timer.html) - `systemctl --user edit showRSS.timer`.

## Configuration

Modify `/home/$USER/.config/showRSS/showRSS.conf` to your needs.

See [showRSS.conf.example](showRSS.conf.example) for an example configuration.

| Section | Variable | Default | Description |
|---|---|---|---|
| `notification` | `command` | `null` | The command that sends the notification |
| `notification` | `maxlength` | `1024` | Maximum length of a single notifications, multiple will be send if this value is exceeded |
| `options` | `user_id` | `null` | You can get it [on the website](https://showrss.info/feeds), it's in the feed addresss |
| `options` | `schedule` | `false` | Use schedule feed instead of torrent feed |
| `options` | `magnets` | `true` | Use magnet links, same setting as [on the website](https://showrss.info/feeds) |
| `options` | `name` | `clean` | Name format, same setting as [on the website](https://showrss.info/feeds) |
| `options` | `quality` | `any` | Desired quality, same setting as [on the website](https://showrss.info/feeds) |