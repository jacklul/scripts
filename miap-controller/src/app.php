<?php declare (strict_types = 1);
/**
 * Made by Jack'lul <jacklul.github.io>
 */

use Dotenv\Dotenv;
use MiIO\Devices\AirPurifier;
use MiIO\MiIO;
use MiIO\Models\Device;
use MiIO\Models\Response;
use Socket\Raw\Factory as SocketFactory;
use Socket\Raw\Socket;

final class MIAPController
{
    /**
     * Socket object handle
     * 
     * @var Socket
     */
    private $socket = null;

    /**
     * Device object handle
     * 
     * @var AirPurifier
     */
    private $device = null;

    /**
     * Current device model
     * 
     * @var string
     */
    private $model = null;

    /**
     * Are we connected to the device?
     *
     * @var bool
     */
    private $connected = false;

    /**
     * Cached stats, waiting to be inserted to the database
     *
     * @var array
     */
    private $stats = [];

    /**
     * @var array
     */
    private $config = [
        'DEBUG'                 => false,   // Will output debug information
        'TEST'                  => false,   // Will read from device but will not perform any actions (instead will fake them)
        'DEVICE_IP'             => null,    // Required: device's IP address
        'DEVICE_TOKEN'          => null,    // Required: device's token
        'TIMEZONE'              => 'UTC',   // Required: timezone to use
        'LOG_FILE'              => null,    // Path to log file
        'CONSOLE_LOG_DATE'      => false,   // Will output date in console log
        'CONNECT_RETRY'         => 60,      // Number of seconds to wait before retrying to connect to device
        'POLLING_PERIOD'        => 5,       // Number of seconds to wait before executing next loop iteration
        'AQI_CHECK_PERIOD'      => 60,      // Number of seconds to wait before checking device status
        'AQI_DISABLE_THRESHOLD' => 5,       // AQI threshold to disable the device
        'AQI_ENABLE_THRESHOLD'  => 10,      // AQI threshold to enable the device
        'TIME_ENABLE'           => '08:00', // When to enable the device
        'TIME_DISABLE'          => '00:00', // When to disable the device
        'TIME_SILENT'           => '22:00', // When to enable silent mode
        'DBFILE'                => null,    // Database to log AQI data to (sqlite file path)
        'DBINTERVAL'            => 60,      // Database write interval
        'DBMAXDAYS'             => 0,       // Database record lifetime in days
        'DBMAXSIZE'             => 0,       // Database max size in bytes
    ];

    /**
     * @var array
     */
    private $modelMapping = [
        'zhimi.airpurifier.ma4' => 'base',
        'zhimi.airpurifier.mb3' => 'base',
        'zhimi.airpurifier.va1' => 'base',
        'zhimi.airpurifier.vb2' => 'base',
        'zhimi.airpurifier.mb4' => 'MB4',
        'zhimi.airp.mb4a'       => 'MB4',
        'zhimi.airp.va2'        => 'VA2',
    ];

    /**
     * Service mappings for certain Air Purifier models
     * Taken from https://python-miio.readthedocs.io/en/latest/_modules/miio/airpurifier_miot.html
     * 
     * @var array
     */
    private $serviceMapping = [
        'base' => [
            # Air Purifier (siid=2)
            'power' => ['siid' => 2, 'piid' => 2],
            'fan_level' => ['siid' => 2, 'piid' => 4],
            'mode' => [
                'siid' => 2,
                'piid' => 5,
                'values' => [
                    'auto' => 0,
                    'silent' => 1,
                    'favorite' => 2,
                    'fan' => 3,
                ],
            ],
            # Environment (siid=3)
            'humidity' => ['siid' => 3, 'piid' => 7],
            'temperature' => ['siid' => 3, 'piid' => 8],
            'aqi' => ['siid' => 3, 'piid' => 6],
            # Filter (siid=4)
            'filter_life_remaining' => ['siid' => 4, 'piid' => 3],
            'filter_hours_used' => ['siid' => 4, 'piid' => 5],
            # Alarm (siid=5)
            'buzzer' => ['siid' => 5, 'piid' => 1],
            'buzzer_volume' => ['siid' => 5, 'piid' => 2],
            # Indicator Light (siid=6)
            'led_brightness' => [
                'siid' => 6,
                'piid' => 1,
                'values' => [
                    'off' => 2,
                    'dim' => 1,
                    'bright' => 0,
                ]
            ],
            'led' => ['siid' => 6, 'piid' => 6],
            # Physical Control Locked (siid=7)
            'child_lock' => ['siid' => 7, 'piid' => 1],
            # Motor Speed (siid=10)
            'favorite_level' => ['siid' => 10, 'piid' => 10],
            'favorite_rpm' => ['siid' => 10, 'piid' => 7],
            'motor_speed' => ['siid' => 10, 'piid' => 8],
            # Use time (siid=12)
            'use_time' => ['siid' => 12, 'piid' => 1],
            # AQI (siid=13)
            'purify_volume' => ['siid' => 13, 'piid' => 1],
            'average_aqi' => ['siid' => 13, 'piid' => 2],
            'aqi_realtime_update_duration' => ['siid' => 13, 'piid' => 9],
            # RFID (siid=14)
            'filter_rfid_tag' => ['siid' => 14, 'piid' => 1],
            'filter_rfid_product_id' => ['siid' => 14, 'piid' => 3],
            # Other (siid=15)
            'app_extra' => ['siid' => 15, 'piid' => 1],
        ],
        'MB4' => [
            # Air Purifier
            'power' => ['siid' => 2, 'piid' => 1],
            'mode' => [
                'siid' => 2,
                'piid' => 4,
                'values' => [
                    'auto' => 0,
                    'silent' => 1,
                    'favorite' => 2,
                    'fan' => 3,
                ],
            ],
            # Environment
            'aqi' => ['siid' => 3, 'piid' => 4],
            # Filter
            'filter_life_remaining' => ['siid' => 4, 'piid' => 1],
            'filter_hours_used' => ['siid' => 4, 'piid' => 3],
            # Alarm
            'buzzer' => ['siid' => 6, 'piid' => 1],
            # Screen
            'led_brightness_level' => [
                'siid' => 7,
                'piid' => 2,
                'values' => [
                    'off' => 0,
                    'dim' => 1,
                    'bright' => 2,
                ],
            ],
            # Physical Control Locked
            'child_lock' => ['siid' => 8, 'piid' => 1],
            # custom-service
            'motor_speed' => ['siid' => 9, 'piid' => 1],
            'favorite_rpm' => ['siid' => 9, 'piid' => 3],
        ],
        'VA2' => [
            # Air Purifier
            'power' => ['siid' => 2, 'piid' => 1],
            'mode' => [
                'siid' => 2,
                'piid' => 4,
                'values' => [
                    'auto' => 0,
                    'silent' => 1,
                    'favorite' => 2,
                    'fan' => 3,
                ],
            ],
            'fan_level' => ['siid' => 2, 'piid' => 5],
            'anion' => ['siid' => 2, 'piid' => 6],
            # Environment
            'humidity' => ['siid' => 3, 'piid' => 1],
            'aqi' => ['siid' => 3, 'piid' => 4],
            'temperature' => ['siid' => 3, 'piid' => 7],
            # Filter
            'filter_life_remaining' => ['siid' => 4, 'piid' => 1],
            'filter_hours_used' => ['siid' => 4, 'piid' => 3],
            'filter_left_time' => ['siid' => 4, 'piid' => 4],
            # Alarm
            'buzzer' => ['siid' => 6, 'piid' => 1],
            # Physical Control Locked
            'child_lock' => ['siid' => 8, 'piid' => 1],
            # custom-service
            'motor_speed' => ['siid' => 9, 'piid' => 1],
            'favorite_rpm' => ['siid' => 9, 'piid' => 3],
            'favorite_level' => ['siid' => 9, 'piid' => 5],
            # aqi
            'purify_volume' => ['siid' => 11, 'piid' => 1],
            'average_aqi' => ['siid' => 11, 'piid' => 2],
            'aqi_realtime_update_duration' => ['siid' => 11, 'piid' => 4],
            # RFID
            'filter_rfid_tag' => ['siid' => 12, 'piid' => 1],
            'filter_rfid_product_id' => ['siid' => 12, 'piid' => 3],
            # Screen
            'led_brightness' => [
                'siid' => 13,
                'piid' => 2,
                'values' => [
                    'off' => 2,
                    'dim' => 1,
                    'bright' => 0,
                ],
            ],
        ]
    ];

    /**
     * @param array $args
     */
    public function __construct(array $args)
    {
        $script_path = dirname(__DIR__);
        $config_names = ['.env'];

        if (substr($_SERVER['SCRIPT_NAME'], -4) === 'phar') {
            $script_path = dirname(str_replace('phar://', '', $script_path)); // Get path to phar location
            $config_names = ['miap-controller.conf'];
        }

        if (isset($args[1]) && file_exists($args[1])) {
            $user_config = dirname(dirname($args[1]) . DIRECTORY_SEPARATOR . basename($args[1]));
            $config_names = [
                basename($args[1])
            ];
        }

        // Load variables using dotenv
        $config = Dotenv::createArrayBacked($user_config ?? $script_path, $config_names)->load();

        // Parse boolean and null values
        foreach ($config as &$value) {
            if ($value === 'true') {
                $value = true;
            } elseif ($value === 'false') {
                $value = false;
            } elseif ($value === 'null') {
                $value = null;
            }
        }
        unset($value);

        // Merge-replace with default config
        $this->config = array_replace_recursive($this->config, $config);

        // We need to have correct timezone set
        date_default_timezone_set($this->config['TIMEZONE']);

        // Verify required configuration
        foreach (['DEVICE_IP', 'DEVICE_TOKEN'] as $key) {
            if (empty($this->config[$key])) {
                $this->printAndLog('Required setting "' . $key . '" not set!', 'ERROR');
                exit(1);
            }
        }

        // Verify required numeric values
        foreach (['AQI_ENABLE_THRESHOLD', 'AQI_DISABLE_THRESHOLD', 'AQI_CHECK_PERIOD', 'POLLING_PERIOD', 'CONNECT_RETRY', 'DBINTERVAL', 'DBMAXDAYS'] as $key) {
            if (
                !is_numeric($this->config[$key]) &&
                (in_array($key, ['AQI_ENABLE_THRESHOLD', 'AQI_DISABLE_THRESHOLD']) && !is_null($this->config[$key]))
            ) {
                $this->printAndLog('Setting "' . $key . '" must be a number!', 'ERROR');
                exit(1);
            } else {
                // Cast the value to integer
                $this->config[$key] = (int) $this->config[$key];
            }
        }

        // Verify require time values
        foreach (['TIME_ENABLE', 'TIME_DISABLE', 'TIME_SILENT'] as $key) {
            if ($this->config[$key] !== null && substr_count($this->config[$key], ':') !== 1) {
                $this->printAndLog('Setting "' . $key . '" uses invalid time format!', 'ERROR');
                exit(1);
            }
        }

        // Check if thresholds are correctly set
        if (
            $this->config['AQI_ENABLE_THRESHOLD'] !== null &&
            $this->config['AQI_DISABLE_THRESHOLD'] !== null &&
            $this->config['AQI_ENABLE_THRESHOLD'] <= $this->config['AQI_DISABLE_THRESHOLD']
        ) {
            $this->printAndLog('Setting "AQI_ENABLE_THRESHOLD" must be bigger than "AQI_DISABLE_THRESHOLD"!', 'ERROR');
            exit(1);
        }

        // Make sure the script will not be useless
        $configOk = false;
        foreach (['AQI_ENABLE_THRESHOLD', 'AQI_DISABLE_THRESHOLD', 'TIME_ENABLE', 'TIME_DISABLE', 'TIME_SILENT'] as $key) {
            if ($this->config[$key] !== null) {
                $configOk = true;
                break;
            }
        }

        if ($configOk == false) {
            $this->printAndLog('All of the following setting variables are not set: ' . implode(', ', ['AQI_ENABLE_THRESHOLD', 'AQI_DISABLE_THRESHOLD', 'TIME_ENABLE', 'TIME_DISABLE', 'TIME_SILENT']), 'ERROR');
            $this->printAndLog('Script will do nothing without a valid configuration.', 'ERROR');
            exit(1);
        }

        // Print whole configuration when debug is on
        if ($this->config['DEBUG']) {
            error_reporting(E_ALL);
            ini_set('display_errors', '1');

            ob_start();
            var_dump($this->config);
            $this->printAndLog('Configuration: ' . preg_replace('/=>\s+/', ' => ', ob_get_clean()), 'DEBUG');
        }

        // If user disabled these set those to 0 and -1 respectively
        foreach (['AQI_ENABLE_THRESHOLD', 'AQI_DISABLE_THRESHOLD'] as $key) {
            if (!is_numeric($this->config[$key])) {
                if ($key === 'AQI_ENABLE_THRESHOLD') {
                    $this->config[$key] = 0;
                } else {
                    $this->config[$key] = -1;
                }
            }
        }

        if (function_exists('pcntl_signal')) {
            declare(ticks = 1);

            $interrupt = function($signo = 130) {
                echo PHP_EOL;
                
                if (!empty($this->config['DBFILE'])) {
                    $this->writeStats();
                }

                $this->printAndLog(PHP_EOL . 'User interrupted' . PHP_EOL, 'NOTICE');
                
                exit(130);
            };

            pcntl_signal(SIGHUP, $interrupt);
            pcntl_signal(SIGTERM, $interrupt);
            pcntl_signal(SIGINT, $interrupt);
        } else {
            register_shutdown_function(function() {
                if (!empty($this->config['DBFILE'])) {
                    $this->writeStats();
                }
            });
        }
    }

    /**
     * @return void
     */
    public function run(): void
    {
        !$this->config['CONSOLE_LOG_DATE'] && $this->printAndLog('Start time: ' . ((new DateTime('now'))->format('Y-m-d H:i:s')));

        $lastAqiCheck = 0;
        $lastStatsSave = !empty($this->config['DBFILE']) ? time() : null;
        $lastStatsClean = !empty($this->config['DBMAXDAYS']) ? 0 : null;
        while (true) {
            if ($this->device === null) {
                $this->connect($this->model !== null);
            } else {
                sleep($this->config['POLLING_PERIOD']);
            }

            $properties = [];
            $time = new DateTime('now');

            if ($this->config['TIME_ENABLE'] !== null) {
                $timeEnable = DateTime::createFromFormat('H:i', $this->config['TIME_ENABLE']);
            } else {
                $timeEnable = (clone $time)->modify('-1 minute');
            }

            if ($this->config['TIME_DISABLE'] !== null) {
                $timeDisable = DateTime::createFromFormat('H:i', $this->config['TIME_DISABLE']);
            } else {
                $timeDisable = (clone $time)->modify('+1 minute');
            }

            if ($this->config['TIME_SILENT'] !== null) {
                $timeSilent = DateTime::createFromFormat('H:i', $this->config['TIME_SILENT']);
            } else {
                $timeSilent = (clone $time)->modify('+1 minute');
            }

            //  Time corrections
            if ($timeDisable < $timeEnable && $time > $timeEnable) {
                $timeDisable->modify('+1 day');
            } elseif ($timeDisable > $timeEnable && $time < $timeEnable) {
                $timeDisable->modify('-1 day');
            }

            if ($lastAqiCheck + (int)$this->config['AQI_CHECK_PERIOD'] <= time()) {
                if ($this->config['DEBUG']) {
                    ob_start();
                    var_dump([
                        'time' => $time->format('Y-m-d H:i:s'),
                        'timeEnable' => $timeEnable->format('Y-m-d H:i:s'),
                        'timeDisable' => $timeDisable->format('Y-m-d H:i:s'),
                        'timeSilent' => $timeSilent->format('Y-m-d H:i:s'),
                    ]);
                    $this->printAndLog('Time variables: ' . preg_replace('/=>\s+/', ' => ', ob_get_clean()), 'DEBUG');
                }

                $lastAqiCheck = time();

                if (!empty($properties += $this->getProperties(['power', 'mode', 'aqi']))) {
                    $this->printAndLog('AQI value is ' . $properties['aqi']);

                    $this->stats[] = [
                        'aqi' => $properties['aqi'],
                        'time' => time(),
                    ];

                    if ($properties['mode'] === 'favorite') {
                        $this->printAndLog('User override active (mode = favorite)', 'DEBUG');
                        // User mode - do nothing
                        continue;
                    }

                    if ($time > $timeEnable && $time < $timeDisable) {
                        $this->printAndLog('In enabled time period', 'DEBUG');

                        if ($properties['aqi'] >= $this->config['AQI_ENABLE_THRESHOLD']) {
                            if ($time < $timeSilent && $properties['mode'] !== 'auto') {
                                $this->switchMode('auto');
                            } elseif ($time > $timeSilent && $properties['mode'] !== 'silent') {
                                $this->switchMode('silent');
                            }

                            if ($properties['power'] === false) {
                                $this->switchPower(true);
                            }
                        } elseif ($properties['aqi'] <= $this->config['AQI_DISABLE_THRESHOLD']) {
                            if ($properties['power'] === true) {
                                $this->switchPower(false);
                            }
                        }
                    }
                }
            }

            if ($time > $timeEnable && $time < $timeDisable && $time > $timeSilent) {
                $this->printAndLog('In silent time period', 'DEBUG');

                if (
                    (isset($properties['mode']) ||
                        !empty($properties += ['mode' => $this->getProperty('mode')]))
                ) {
                    if ($properties['mode'] !== 'silent') {
                        $this->switchMode('silent');
                    }
                }
            }

            if ($time > $timeDisable && $time < $timeEnable) {
                $this->printAndLog('In disabled time period', 'DEBUG');

                if (
                    (isset($properties['mode'], $properties['power'])) ||
                    !empty($properties += $this->getProperties(['mode', 'power']))
                ) {
                    if ($properties['mode'] !== 'favorite' && $properties['power'] === true) {
                        $this->switchPower(false);
                    }
                }
            }

            if ($lastStatsClean !== null && $lastStatsClean + $this->config['DBMAXDAYS'] <= time()) {
                $lastStatsClean = time();
                $this->cleanStats();
            }

            if ($lastStatsSave !== null && $lastStatsSave + $this->config['DBINTERVAL'] <= time()) {
                $lastStatsSave = time();
                $this->writeStats();
            }
        }
    }

    /**
     * @return void
     */
    private function connect(bool $reconnect = false): void
    {
        // Initialize AirPurifier object
        $this->socket = (new SocketFactory())->createUdp4();
        $this->device = new AirPurifier(new Device($this->socket, $this->config['DEVICE_IP'], $this->config['DEVICE_TOKEN']));

        $status = false;
        while (!$status) {
            if ($reconnect) {
                $this->printAndLog('Reconnecting...');
            } else {
                $this->printAndLog('Connecting...');
            }

            $result = $this->queryDevice(MiIO::INFO);

            if ($result instanceof Response) {
                $properties = $result->getResult();

                if (isset($properties['model'])) {
                    if (strpos($properties['model'], '.airpurifier') === false) {
                        $this->printAndLog('Unsupported device type - must be an Air Purifier!', 'ERROR');

                        exit(1);
                    }

                    $this->printAndLog('Connected to ' . $properties['model'] . ' (FW: ' . $properties['fw_ver'] . ', miIO: ' . $properties['miio_ver'] . ')');

                    if ($reconnect && $properties['model'] !== $this->model) {
                        $this->printAndLog('Device model changed from ' . $this->model . ' to ' . $properties['model'], 'WARNING');
                    }

                    $this->model = $properties['model'];
                    $this->connected = true;
                    $status = true;
                    break;
                }
            }

            if (!$status) {
                $this->printAndLog('Will retry in ' . $this->config['CONNECT_RETRY'] . ' seconds...');
                sleep((int)$this->config['CONNECT_RETRY']);
            }
        }
    }

    /**
     * @return void
     */
    private function disconnect(): void
    {
        if ($this->device !== null) {
            $this->connected = false;
            $this->device = null;
            $this->socket->close();
            $this->socket = null;
        }
    }

    /**
     * @param bool $state
     *
     * @return bool
     */
    private function switchPower(bool $state): bool
    {
        $status = $this->setProperty('power', $state);
        $status && $this->printAndLog('Power switched to ' . ($state ? 'on' : 'off'));

        return $status;
    }

    /**
     * @param string $mode
     *
     * @return bool
     */
    private function switchMode(string $mode): bool
    {
        $status = $this->setProperty('mode', $mode);
        $status && $this->printAndLog('Mode switched to "' . $mode . '"');

        return $status;
    }

    /**
     * @param array $properties
     *
     * @return array|null
     */
    private function getProperties(array $properties = []): array
    {
        $serviceMapping = $this->getServiceMapping();

        if (empty($properties)) {
            $properties = array_keys($serviceMapping);
        }

        $this->config['DEBUG'] && $this->printAndLog('getProperties: ' . json_encode($properties), 'DEBUG');

        $return = [];

        switch ($this->model) {
            case 'zhimi.airpurifier.mb4':
            case 'zhimi.airpurifier.ma4':
            case 'zhimi.airpurifier.mb3':
            case 'zhimi.airpurifier.va1':
            case 'zhimi.airpurifier.vb2':
            case 'zhimi.airpurifier.mb4':
            case 'zhimi.airp.mb4a':
            case 'zhimi.airp.va2':
                $propertiesProper = [];
                foreach ($properties as $property) {
                    if (!isset($serviceMapping[$property])) {
                        throw new Exception('Unknown property "' . $property . '"');
                    }

                    $propertiesProper[] = [
                        'siid' => $serviceMapping[$property]['siid'],
                        'piid' => $serviceMapping[$property]['piid'],
                    ];
                }

                $result = $this->queryDevice('get_properties', $propertiesProper);

                if ($result instanceof Response) {
                    $resultProperties = $result->getResult();

                    $this->config['DEBUG'] && $this->printAndLog('getProperties result: ' . json_encode($resultProperties), 'DEBUG');

                    foreach ($resultProperties as $resultProperty) {
                        $propertyName = $this->getPropertyNameFromSiidAndPiid($resultProperty['siid'], $resultProperty['piid']);

                        if (isset($serviceMapping[$propertyName]['values'])) {
                            foreach ($serviceMapping[$propertyName]['values'] as $key => $keyValue) {
                                if ($keyValue === $resultProperty['value']) {
                                    $return[$propertyName] = $key;
                                    continue 2;
                                }
                            }
                        } else {
                            $return[$propertyName] = $resultProperty['value'];
                        }
                    }
                }
                break;
            default:
                throw new Exception('Unsupported device model: "' . $this->model . '"');
        }

        if (empty($return)) {
            $this->printAndLog('Failed to fetch properties from the device', 'WARNING');
        }

        return $return;
    }

    /**
     * @param string $property
     *
     * @return array|null
     */
    private function getProperty(string $property)
    {
        return $this->getProperties([$property])[$property] ?? null;
    }

    /**
     * @param array $propertyValues
     *
     * @return bool
     */
    private function setProperties(array $propertyValues = []): bool
    {
        $serviceMapping = $this->getServiceMapping();

        if (empty($propertyValues)) {
            throw new Exception('Properties must be set');
        }

        if ($this->config['TEST']) {
            return true;
        }

        $this->config['DEBUG'] && $this->printAndLog('setProperties: ' . json_encode($propertyValues), 'DEBUG');

        switch ($this->model) {
            case 'zhimi.airpurifier.mb4':
            case 'zhimi.airpurifier.ma4':
            case 'zhimi.airpurifier.mb3':
            case 'zhimi.airpurifier.va1':
            case 'zhimi.airpurifier.vb2':
            case 'zhimi.airpurifier.mb4':
            case 'zhimi.airp.mb4a':
            case 'zhimi.airp.va2':
                $propertiesProper = [];
                foreach ($propertyValues as $property => $value) {
                    if (!isset($serviceMapping[$property])) {
                        throw new Exception('Unknown property "' . $property . '"');
                    }

                    if (isset($serviceMapping[$property]['values'])) {
                        if (!isset($serviceMapping[$property]['values'][$value])) {
                            throw new Exception('Unknown value "' . $value . '" for property "' . $property . '"');
                        }

                        foreach ($serviceMapping[$property]['values'] as $key => $keyValue) {
                            if ($key === $value) {
                                $propertiesProper[] = [
                                    'siid' => $serviceMapping[$property]['siid'],
                                    'piid' => $serviceMapping[$property]['piid'],
                                    'value' => $keyValue,
                                ];

                                continue 2;
                            }
                        }
                    } else {
                        $propertiesProper[] = [
                            'siid' => $serviceMapping[$property]['siid'],
                            'piid' => $serviceMapping[$property]['piid'],
                            'value' => $value,
                        ];
                    }
                }

                $result = $this->queryDevice('set_properties', $propertiesProper);

                if ($result instanceof Response) {
                    $resultProperties = $result->getResult();

                    $this->config['DEBUG'] && $this->printAndLog('setProperties result: ' . json_encode($resultProperties), 'DEBUG');

                    $success = true;
                    foreach ($resultProperties as $resultProperty) {
                        if (isset($resultProperty['code']) && $resultProperty['code'] !== 0) {
                            $propertyName = $this->getPropertyNameFromSiidAndPiid($resultProperty['siid'], $resultProperty['piid']);

                            if (is_bool($value)) {
                                $value = $value ? 'true' : 'false';
                            }

                            $this->printAndLog('Failed to set property "' . $propertyName . '" to "' . $value . '"!', 'ERROR');

                            $success = false;
                        }
                    }

                    return $success;
                }
                break;
            default:
                throw new Exception('Unsupported device model: "' . $this->model . '"');
        }

        $this->printAndLog('Failed to set properties on the device', 'WARNING');

        return false;
    }

    /**
     * @param string $property
     * @param mixed $value
     *
     * @return bool
     */
    private function setProperty(string $property, $value): bool
    {
        return $this->setProperties([$property => $value]);
    }

    /**
     * @param string $siid
     * @param string $piid
     *
     * @return array
     */
    private function getServiceMapping(): array
    {
        $index = $this->modelMapping[$this->model] ?? null;

        if ($index === null) {
            throw new Exception('Unsupported device model: "' . $this->model . '"');
        }

        return $this->serviceMapping[$index];
    }

    /**
     * @param int $siid
     * @param int $piid
     *
     * @return string|null
     */
    private function getPropertyNameFromSiidAndPiid(int $siid, int $piid): ?string
    {
        $serviceMapping = $this->getServiceMapping();

        foreach ($serviceMapping as $propertyName => $propertyData) {
            if ($siid == $propertyData['siid'] && $piid == $propertyData['piid']) {
                return $propertyName;
            }
        }

        return null;
    }

    /**
     * @param string $method
     * @param array $args
     *
     * @return Response|null
     */
    private function queryDevice(string $method, array $args = []): ?Response
    {
        if ($this->device === null) {
            return null;
        }

        $this->config['DEBUG'] && $this->printAndLog('queryDevice: ' . $method . ' ' . json_encode($args), 'DEBUG');

        $result = null;
        try {
            $this->device->send($method, $args)
                ->done(function ($response) use (&$result) {
                    if ($response instanceof Response) {
                        $result = $response;
                    } else {
                        throw new Exception('Received invalid, empty or no response from the device');
                    }
                }, function (Exception $e) {
                    throw $e;
                });
        } catch (Exception $e) {
            $this->printAndLog($e->getMessage(), 'ERROR');

            $this->connected && $this->disconnect(); // Initiate reconnect
        }

        return $result;
    }

    /**
     * @param string $text
     * @param string $severity
     * @param bool $logOnly
     *
     * @return void
     */
    private function printAndLog($message, $severity = 'INFO', $logOnly = false): void
    {
        if (!in_array(strtoupper($severity), ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR'])) {
            throw new RuntimeException('Invalid log severity: ' . $severity);
        }

        if (strtoupper($severity) === 'DEBUG' && $this->config['DEBUG'] !== true) {
            return;
        }

        if (!empty($this->config['LOG_FILE'])) {
            if (!file_exists($this->config['LOG_FILE']) && !@touch($this->config['LOG_FILE'])) {
                throw new RuntimeException('Unable to create log file: ' . $this->config['LOG_FILE']);
            }

            $lines = preg_split('/\r\n|\r|\n/', ucfirst(trim($message)));
            foreach ($lines as &$line) {
                $line = '[' . date('Y-m-d H:i:s') . '] [' . strtoupper($severity) . ']' . "\t" . $line;
            }
            unset($line);

            file_put_contents(
                $this->config['LOG_FILE'],
                implode(PHP_EOL, $lines) . PHP_EOL,
                FILE_APPEND | LOCK_EX
            );
        }

        if ($logOnly) {
            return;
        }

        if ($this->config['CONSOLE_LOG_DATE']) {
            $message = '[' . date('Y-m-d H:i:s') . '] ' . $message;
        }

        print trim($message) . PHP_EOL;
    }

    /**
     * Open database file
     *
     * @return PDO
     */
    private function openDatabase(): ?PDO
    {
        if (empty($this->config['DBFILE']) || !is_string($this->config['DBFILE'])) {
            return null;
        }

        $needs_init = false;
        if (!file_exists($this->config['DBFILE'])) {
            $needs_init = true;
        }

        $dbh = new PDO('sqlite:' . $this->config['DBFILE']);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if ($needs_init) {
            $sth = $dbh->prepare('CREATE TABLE `stats` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `aqi` INTEGERNOT NULL, `date` DATETIME NOT NULL)');
            
            if (!$sth->execute()) {
                $this->printAndLog('Failed to create database schema: ' . $dbh->errorInfo(), 'ERROR');
                exit(1);
            }
        }

        return $dbh;
    }

    /**
     * @return void
     */
    private function writeStats(): void
    {
        if ($dbh = $this->openDatabase()) {
            $stats = $this->stats;
            $this->stats = [];

            $inserted = 0;
            foreach ($stats as $stat) {
                $sth = $dbh->prepare('INSERT INTO `stats` (aqi, date) VALUES (:aqi, :date)');
                $sth->bindParam(':aqi', $stat['aqi'], PDO::PARAM_INT);
                $sth->bindValue(':date', date('Y-m-d H:i:s', $stat['time']), PDO::PARAM_STR);

                if ($sth->execute()) {
                    $this->printAndLog('Inserted new record ID: ' . $dbh->lastInsertId(), 'DEBUG');

                    $inserted++;
                }
            }

            if ($inserted > 0) {
                $this->printAndLog('Inserted ' . $inserted . ' new record(s) to the database', 'INFO');
            }

            $dbh = null;
        }
    }

    /**
     * @return void
     */
    private function cleanStats(): void
    {
        if ($dbh = $this->openDatabase()) {
            $sth = $dbh->prepare('DELETE FROM `stats` WHERE `date` < :date');
            $sth->bindValue(':date', date('Y-m-d H:i:s', strtotime('-' . $this->config['DBMAXDAYS'] . ' days')), PDO::PARAM_STR);
            
            if ($sth->execute()) {
                $this->printAndLog('Affected row count: ' . $sth->rowCount(), 'DEBUG');

                if ($sth->rowCount() > 0) {
                    $this->printAndLog('Cleaned up ' . $sth->rowCount() . ' old record(s) from the database', 'INFO');
                }
            }
            
            if (filesize($this->config['DBFILE']) > $this->config['DBMAXSIZE']) {
                $this->printAndLog('Database size exceeded ' . $this->config['DBMAXSIZE'] . ' bytes, performing cleanup...', 'INFO');

                $started = time();
                $removed = 0;
                $toremove = ceil((filesize($this->config['DBFILE']) - $this->config['DBMAXSIZE']) / 32);
                do {
                    if ($dbh === null && !($dbh = $this->openDatabase())) {
                        break;
                    }

                    $sth = $dbh->prepare('DELETE FROM `stats` WHERE `id` IN (SELECT `id` FROM `stats` ORDER BY `id` ASC LIMIT :limit)');
                    $sth->bindParam(':limit', $toremove, PDO::PARAM_INT);
                    
                    if ($sth->execute()) {
                        $removed += $toremove;
                        $toremove = ceil($toremove/2);
                        
                        $dbh->query('VACUUM');
                        $dbh = null;
                        clearstatcache();
                    }
                } while (filesize($this->config['DBFILE']) > $this->config['DBMAXSIZE'] && $started + 10 > time());
                
                if ($removed > 0) {
                    $this->printAndLog('Removed ' . $removed . ' oldest record(s) from the database', 'INFO');
                }
            } else {
                $dbh = null;
            }
        }
    }
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

$app = new MIAPController($argv);
$app->run();
