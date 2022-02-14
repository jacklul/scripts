#!/usr/bin/env node
/**
 * @author  Jack'lul <jacklul.github.io>
 * @license MIT
 */

const dotenv = require('dotenv');
const miio = require('miio');

let dotenv_path = process.cwd() + '\\.env';

process.argv.slice(2).forEach(function (val, index, array) {
  const data = array[index].split("=");

  switch(data[0]) {
    case 'config':
    case '-c':
    case '--config':
      dotenv_path = data[1];
  }
});

dotenv.config({ path: dotenv_path })

const config = {
  config_file: dotenv_path,
  device_ip: process.env.DEVICE_IP,
  device_token: process.env.DEVICE_TOKEN,
  debug: process.env.DEBUG == 'true',
  log_file: process.env.LOG_FILE || "",
  console_log_date: process.env.CONSOLE_LOG_DATE == "false",
  connect_retry: process.env.CONNECT_RETRY || 60,
  use_aqi_change_event: process.env.USE_AQI_CHANGE_EVENT == 'false',
  aqi_check_period: process.env.AQI_CHECK_PERIOD || 60,
  aqi_disable_threshold: process.env.AQI_DISABLE_THRESHOLD || 5,
  aqi_enable_threshold: process.env.AQI_ENABLE_THRESHOLD || 10,
  time_enable: process.env.TIME_ENABLE || '08:00',
  time_disable: process.env.TIME_DISABLE || '00:00',
  time_silent: process.env.TIME_SILENT || '22:00',
};

if (!process.env.DEVICE_IP) {
  log('DEVICE_IP not defined!');
  process.exit();
}

if (!process.env.DEVICE_TOKEN) {
  log('DEVICE_TOKEN not defined!');
  process.exit();
}

if (parseInt(config.aqi_enable_threshold) <= parseInt(config.aqi_disable_threshold)) {
  log('AQI_ENABLE_THRESHOLD must be bigger than AQI_DISABLE_THRESHOLD!');
  process.exit();
}

if (config.debug) {
  log('Configuration', config);
}

process.on('uncaughtException', function(exception) {
  log('Uncaught exception', exception);
});

device_connection();

function log(text, variable = null) {
  const date_prefix = '[' + getFormattedDate() + '] ';
  let console_prefix = '';

  if (config.console_log_date) {
    console_prefix = date_prefix;
  }

  if (variable !== null) {
    console.log(console_prefix + text, variable);
  } else {
    console.log(console_prefix + text);
  }

  if (config.log_file !== '') {
    const fs = require('fs');
    const file = fs.createWriteStream(config.log_file, { flags: 'a' });

    if (variable !== null) {
      file.write(date_prefix + text + ' ' + JSON.stringify(variable) + '\n');
    } else {
      file.write(date_prefix + text + '\n');
    }
  }
}

function handleError(error) {
  log(error);
}

function getFormattedDate(){
    var d = new Date();
    return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}

function getTime(seconds = true) {
  const d = new Date();
  return ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + (seconds ? ":" + ('0' + d.getSeconds()).slice(-2) : '');
}

function device_connection() {
  let connectionInterval = null;

  log('Connecting...');
  
  miio.device({
    address: config.device_ip,
    token: config.device_token
  }).then(device => {
    if (config.debug) {
      log('Connected to', device);
      device.loadProperties(['power', 'mode', 'aqi', 'favorite_rpm', 'filter_life_remaining', 'filter_hours_used', 'led_brightness_level', 'buzzer'])
        .then(result => log('Device state', result));
    } else {
      log('Connected to', device.miioModel);
    }

    if (device.matches('type:air-purifier')) {
      set_schedule_rules(device);

      if (connectionInterval) {
        clearInterval(connectionInterval);
      }
    } else {
      log('This device is not Air Purifier');
      process.exit();
    }
  }).catch(error => {
    handleError(error)

    log('Will retry in ' + config.connect_retry + ' seconds...');

    if (!connectionInterval) {
      connectionInterval = setInterval(function() {
        device_connection();
      }, config.connect_retry * 1000);
    }
  });
}

function switchPower(device, value = true)
{
  device
    .setPower(value)
    .then(() => log('Switched power to', value))
    .catch(error => handleError(error));
}

function switchMode(device, value = 'auto')
{
  device.setMode(value)
    .then((mode) => log('Switched mode to', mode))
    .catch(error => handleError(error));
}

function set_schedule_rules(device) {
  // When AQI value changes
  if (config.use_aqi_change_event) {
    log('Registering AQI change event handler');

    device.on('pm2.5Changed', value => {
      log('AQI value is', value)

      control_device_on_off(device, value);
    });
  } else {
    setInterval(() => {
      device.loadProperties(['aqi'])
        .then(result => {
          log('AQI value is', result['aqi']);

          control_device_on_off(device, result['aqi']);
        });
    }, config.aqi_check_period * 1000);
  }

  setInterval(() => {
    if (getTime(false) == config.time_disable) { // Shutdown
      device.power().then(isOn => {
        if (isOn === true) {
          switchPower(device, false);
        }
      });
    } else if (getTime(false) == config.time_silent) { // Night mode
      device.mode().then(mode => {
        if (mode != 'silent' && mode != 'favorite') {
          switchMode(device, 'silent');
        }
      });
    }
  }, 1000);
}

function control_device_on_off(device, aqi)
{
  const time = getTime();
  let time_disable = config.time_disable;

  if (config.time_disable < config.time_enable && config.time_disable.split(':')[0] == '00' && time <= '23:59:59') {
    time_disable = '23:59';
  }

  if (time >= config.time_enable + ':00' && time < time_disable + ':00') {
    device.mode().then(mode => {
      if (mode === 'favorite') {
        return;
      }

      if (aqi >= config.aqi_enable_threshold) {
        if (time < config.time_silent + ':00') {
          if (mode !== 'auto') {
            switchMode(device, 'auto');
          }
        }

        device.power().then(isOn => {
          if (isOn === false) {
            switchPower(device, true);
          }
        });
      } else if (aqi <= config.aqi_disable_threshold) {
        device.power().then(isOn => {
          if (isOn === true) {
            switchPower(device, false);
          }
        });
      }
    })
  }
}
