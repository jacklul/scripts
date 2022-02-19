# miap-controller-node

Basic automation control for Xiaomi Air Purifiers.

Most models should be supported but might have issues with specific time values set in settings below due to simple comparison method.

Uses [aholstenson/miio](https://github.com/aholstenson/miio), support for 3C model added in [jacklul/miio#air-purifier-3c](https://github.com/jacklul/miio/tree/air-purifier-3c) fork.

**Will no longer work on this script.**

## Requirements

- systemd
- `nodejs` (tested with 10.24.0)

## Installation

- Copy this whole directory and transfer it to the device
- Run `npm install` or `yarn install` to install the dependencies
- Run `npm build` or `yarn build` to build the script and dependencies into a single file
- Run `install.sh` to install it to `/home/$USER/.local/bin/` directory
- Copy `miap-controller.conf.example` to `/home/$USER/.config/miap-controller.conf` and modify it to your needs

## Configuration

See [miap-controller.conf.example](miap-controller.conf.example) for an example configuration.

| Variable | Default | Description |
|---|---|---|
| `DEVICE_IP` | `null` | Device IP address |
| `DEVICE_TOKEN` | `null` | Device token (when required) |
| `DEBUG` | `false` | Print more information |
| `LOG_FILE` | `null` | Log to file |
| `CONSOLE_LOG_DATE` | `false` | Log current date and time to console output |
| `CONNECT_RETRY` | `60` | How long to wait before retrying connection |
| `USE_AQI_CHANGE_EVENT` | `false` | Use dynamic AQI change event |
| `AQI_CHECK_PERIOD` | `60` | AQI check period |
| `AQI_DISABLE_THRESHOLD` | `5` | AQI value at which the device shuts down |
| `AQI_ENABLE_THRESHOLD` | `10` | AQI value at which the device wakes up |
| `TIME_ENABLE` | `08:00` | Time when device should be activated |
| `TIME_DISABLE` | `00:00` | Time when device should be disabled |
| `TIME_SILENT` | `22:00` | Time when device should be put in silent mode |
