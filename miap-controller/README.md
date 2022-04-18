# miap-controller

Basic automation control for Xiaomi Air Purifiers.

Only few models are supported:
- Air Purifier 3
- Air Purifier 3H
- Air Purifier 3C
- Air Purifier Pro H
- Air Purifier 4 Pro

Uses [ggottwald/miio](https://github.com/ggottwald/miio).

## Requirements

- systemd
- `php-cli` (tested with 7.3.31)
- `Composer`

## Installation

**This script installs into `/home/$USER/.local/bin/` or `/usr/local/bin` depending on whenever you run the install script as root or not.**

I recommend the normal non-root install.

- Copy this whole directory and transfer it to the device
- Run `composer install`
- Run `composer build`
- Run `install.sh`
- (user install) Copy `miap-controller.conf.example` to `/home/$USER/.config/miap-controller.conf` and modify it to your needs
- (root install) Copy `miap-controller.conf.example` to `/etc/miap-controller.conf` and modify it to your needs

## Configuration

See [miap-controller.conf.example](miap-controller.conf.example) for an example configuration.

| Variable | Default | Description |
|---|---|---|
| `DEVICE_IP` | `null` | Device IP address |
| `DEVICE_TOKEN` | `null` | Device token (when required) |
| `TIMEZONE` | `UTC` | Timezone to use - [list of supported values](https://www.php.net/manual/en/timezones.php) |
| `DEBUG` | `false` | Print more information |
| `LOG_FILE` | `null` | Log to file |
| `CONSOLE_LOG_DATE` | `false` | Log current date and time to console output |
| `CONNECT_RETRY` | `60` | How long to wait before retrying connection |
| `AQI_CHECK_PERIOD` | `60` | AQI check period |
| `AQI_DISABLE_THRESHOLD` | `5` | AQI value at which the device shuts down |
| `AQI_ENABLE_THRESHOLD` | `10` | AQI value at which the device wakes up |
| `TIME_ENABLE` | `08:00` | Time when device should be activated |
| `TIME_DISABLE` | `00:00` | Time when device should be disabled |
| `TIME_SILENT` | `22:00` | Time when device should be put in silent mode |

Any of `AQI_DISABLE_THRESHOLD`, `AQI_ENABLE_THRESHOLD`, `TIME_ENABLE`, `TIME_DISABLE`, `TIME_SILENT` can be set to `null` to disable related action.
