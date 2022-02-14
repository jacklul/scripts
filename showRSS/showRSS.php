#!/usr/bin/env php
<?php
/**
 * Made by Jack'lul <jacklul.github.io>
 */

final class HttpClient
{
    /**
     * @var resource
     */
    private $curl;

    /**
     * @var string|null
     */
    private $user_agent;

    /**
     * @var int|null
     */
    private $timeout;

    /**
     * @var array|null
     */
    private $opts;

    /**
     * @var array
     */
    private $cookies = [];

    /**
     * @param array $config
     */
    public function __construct(array $config = null)
    {
        if (!function_exists('curl_init')) {
            throw new RuntimeException('cURL extension not found!');
        }

        $this->init();

        if (is_array($config)) {
            if (isset($config['user_agent'])) {
                $this->user_agent = $config['user_agent'];
            }

            if (isset($config['timeout'])) {
                $this->timeout = $config['timeout'];
            }

            if (isset($config['opts']) && is_array($config['opts'])) {
                $this->opts = $config['opts'];
            }
        }
    }

    /**
     * @param string $function
     * @param array  $parameters
     *
     * @return mixed
     */
    public function __call(string $function, array $parameters)
    {
        $function = strtolower($function);

        if (in_array($function, ['get', 'post'])) {
            return $this->execute($function, isset($parameters[0]) ? $parameters[0] : null, isset($parameters[1]) ? $parameters[1] : []);
        }

        if ($function === 'init' || $function === 'multi_init') {
            is_resource($this->curl) && curl_close($this->curl);

            return $this->curl = call_user_func_array('curl_' . $function, $parameters);
        } else {
            array_unshift($parameters, $this->curl);

            return call_user_func_array('curl_' . $function, $parameters);
        }
    }

    /**
     * @param string $method
     * @param string $url
     * @param array  $options
     *
     * @return HttpResponse
     */
    public function execute(string $method = 'GET', string $url, array $options = null): HttpResponse
    {
        if (!in_array(strtolower($method), ['get', 'post'])) {
            throw new InvalidArgumentException('Unsupported HTTP request method: ' . $method);
        }

        $this->reset(); // Reset opts

        $this->setopt(CURLOPT_URL, $url);
        $this->setopt(CURLOPT_RETURNTRANSFER, true);
        $this->setopt(CURLOPT_FOLLOWLOCATION, true);
        $this->setopt(CURLOPT_HEADER, true);
        $this->setopt(CURLOPT_AUTOREFERER, true);
        $this->setopt(CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        if (strtolower($method) === 'get') {
            $this->setopt(CURLOPT_HTTPGET, true);
        } elseif (strtolower($method) === 'post') {
            $this->setopt(CURLOPT_POST, true);
            $this->setopt(CURLOPT_POSTFIELDS, http_build_query($options['form_params'] ?? []));
        }

        if (isset($options['user_agent'])) {
            $this->setopt(CURLOPT_USERAGENT, $options['user_agent']);
        } elseif ($this->user_agent) {
            $this->setopt(CURLOPT_USERAGENT, $this->user_agent);
        }

        if (isset($options['timeout'])) {
            $this->setopt(CURLOPT_TIMEOUT, $options['timeout']);
        } elseif ($this->timeout) {
            $this->setopt(CURLOPT_TIMEOUT, $this->timeout);
        }

        if (isset($this->opts) && is_array($this->opts)) {
            foreach ($this->opts as $opt => $value) {
                $this->setopt($opt, (int) $value);
            }
        }

        if (isset($options['headers']) && is_array($options['headers'])) {
            // Parse associative array to the expected layout
            if (array_keys($options['headers']) !== range(0, count($options['headers']) - 1)) {
                $newHeaders = [];
                foreach ($options['headers'] as $header => $value) {
                    $newHeaders[] = $header . ': ' . $value;
                }

                $options['headers'] = $newHeaders;
            }

            $this->setopt(CURLOPT_HTTPHEADER, $options['headers']);
        }

        if (isset($options['cookies'])) {
            $this->setopt(CURLOPT_COOKIEJAR, $options['cookies']);
            $this->setopt(CURLOPT_COOKIEFILE, $options['cookies']);
        } elseif (count($this->cookies) > 0) {
            $cookies = [];

            foreach ($this->cookies as $key => $value) {
                $cookies[] = "$key=$value";
            }

            $this->setopt(CURLOPT_COOKIE, implode("; ", $cookies));
        }

        $response = new HttpResponse($exec = $this->exec(), $this->getinfo(CURLINFO_HEADER_SIZE));

        if ($exec === false || $this->errno()) {
            throw new HttpException(!empty($error = $this->error()) ? $error : 'Unknown HTTP error', 0, null, $response);
        }

        $statusCode = !empty($response->getStatusCode()) ? $response->getStatusCode() : $this->getinfo(CURLINFO_HTTP_CODE);
        if ($statusCode !== 200) {
            throw new HttpException('Request ended with status code ' . $statusCode, 0, null, $response);
        }

        preg_match_all("/^Set-cookie: (.*?);/ism", $response->getRawHeaders(), $cookies);
        foreach ($cookies[1] as $cookie) {
            $buffer_explode                                     = strpos($cookie, '=');
            $this->cookies[substr($cookie, 0, $buffer_explode)] = substr($cookie, $buffer_explode + 1);
        }

        return $response;
    }
}

final class HttpResponse
{
    /**
     * @var string
     */
    private $raw_response;

    /**
     * @var string
     */
    private $body;

    /**
     * @var array
     */
    private $headers;

    /**
     * @var int
     */
    private $status_code;

    /**
     * @param string $response
     * @param int    $header_size
     */
    public function __construct(string $response, int $header_size)
    {
        $this->raw_response = $response;

        foreach (explode("\r\n", substr($response, 0, $header_size)) as $i => $line) {
            if ($i === 0 && preg_match('/(\d{3})/', $line, $matches)) {
                $this->headers['status'] = $line;
                $this->status_code       = (int) $matches[1];
            } elseif (!empty($line)) {
                list($key, $value) = explode(': ', $line);

                $this->headers[$key] = $value;
            }
        }

        $this->body = trim(substr($response, $header_size));
    }

    /**
     * @param bool $raw
     *
     * @return array
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * @return string
     */
    public function getBody(): string
    {
        return $this->body;
    }

    /**
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->status_code;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->body;
    }

    /**
     * @return string
     */
    public function getRawResponse(): string
    {
        return $this->raw_response;
    }

    /**
     * @return string
     */
    public function getRawHeaders(): string
    {
        $headers = '';

        foreach ($this->headers as $header => $value) {
            $headers .= $header . ': ' . $value . PHP_EOL;
        }

        return $headers;
    }
}

final class HttpException extends Exception
{
    /**
     * @var HttpResponse|null
     */
    private $response;

    /**
     * @param string        $message
     * @param int           $code
     * @param Exception     $previous
     * @param HttpResponse  $response
     */
    public function __construct($message = null, $code = 0, Exception $previous = null, HttpResponse $response = null)
    {
        $this->response = $response;

        parent::__construct($message, $code, $previous);
    }

    /**
     * @return HttpResponse
     */
    public function getResponse(): HttpResponse
    {
        return $this->response;
    }
}

final class showRSS
{
    /**
     * @var string
     */
    private const XML_ENDPOINT = 'https://showrss.info';

    /**
     * @var int
     */
    private $user_id;

    /**
     * @var array
     */
    private $options;

    /**
     * @var string
     */
    private $cache_file;

    /**
     * @var array
     */
    private $cache;

    /**
     * @var HttpClient
     */
    private $httpClient;

    /**
     * @var callable
     */
    private $callback;

    /**
     * @param array $args
     */
    public function __construct($args)
    {
        $config = $this->loadConfigFile($args[1] ?? null);

        if (isset($config['cache']['cache_file'])) {
            $this->cache_file = $config['cache']['cache_file'];

            if (!is_dir(dirname($config['cache']['cache_file']))) {
                mkdir(dirname($config['cache']['cache_file']), 0755, true);
            }
        } else {
            $this->cache_file = dirname($config['config_file']) . DIRECTORY_SEPARATOR . str_replace('-', '_', pathinfo($config['config_file'], PATHINFO_FILENAME)) . '_data.json';
        }

        if (isset($config['notification']['command'])) {
            $this->callback = function (array $episodes) use ($config) {
                $lastNotification     = 0;
                $notificationFunction = static function ($text) use ($config, $lastNotification) {
                    if (time() === $lastNotification) {
                        sleep(1);
                    }

                    $command = trim(
                        str_replace(
                            '#TEXT#',
                            str_replace('"', '\"', trim($text)),
                            $config['notification']['command']
                        )
                    );

                    if (stripos(PHP_OS, 'WIN') !== 0) {
                        system($command);
                    } else {
                        echo $command . PHP_EOL;
                    }

                    $lastNotification = time();
                };

                $maxlength       = $config['notification']['maxlength'] ?? 1024;
                $notification    = '';
                $notificationTmp = '';

                foreach ($episodes as $episode) {
                    $thisNotification = '';

                    if (empty($thisNotification)) {
                        if (
                            $episode['show_id'] &&
                            (!isset($config['options']['magnets']) || $config['options']['magnets'] === true || $config['options']['magnets'] === null)
                        ) {
                            $thisNotification = '<a href="https://showrss.info/browse/' . $episode['show_id'] . '">' . $episode['title'] . '</a>' . PHP_EOL;
                        } else {
                            $thisNotification = '<a href="' . $episode['link'] . '">' . $episode['title'] . '</a>' . PHP_EOL;
                        }
                    }

                    $notificationTmp = $notification;
                    $notificationTmp .= $thisNotification;

                    if (strlen($notificationTmp) >= $maxlength) {
                        $notificationFunction($notification);
                        $notification = '';
                    }

                    $notification .= $thisNotification;
                }

                if (!empty($notification)) {
                    $notificationFunction($notification);
                }
            };
        } else {
            /**
             * @param array $episodes
             */
            $this->callback = function (array $episodes) {
                foreach ($episodes as $episode) {
                    echo $episode['title'] . PHP_EOL;
                }
            };
        }

        $this->options = $config['options'] ?? [];
        $this->user_id = $this->options['user_id'] ?? null;

        if (count($args) > 0 && isset($args[1]) && is_numeric($args[1])) {
            $this->user_id = $args[1] ?? null;

            if (isset($args[2])) {
                $parts = parse_url('?' . $args[2]);
                parse_str($parts['query'], $options);
            }
        }

        $this->httpClient = new HttpClient([
            'timeout'    => 60,
            'user_agent' => (function_exists('curl_version') ? 'curl/' . curl_version()['version'] . ' ' : '') . 'PHP/' . PHP_VERSION,
        ]);
    }

    /**
     * @var string $config_file
     *
     * @return array
     */
    private function loadConfigFile($config_file)
    {
        $configLocations = [
            __DIR__ . '/showRSS.conf',
            __DIR__ . '/showrss.conf',
        ];

        if (isset($_SERVER['HOME'])) {
            $configLocations = array_merge($configLocations, [
                $_SERVER['HOME'] . '/.config/showRSS/showRSS.conf',
                $_SERVER['HOME'] . '/.config/showRSS/showrss.conf',
                $_SERVER['HOME'] . '/.config/showRSS.conf',
                $_SERVER['HOME'] . '/.config/showrss.conf',
            ]);
        }

        if (isset($config_file) && file_exists($config_file)) {
            array_unshift($configLocations, $config_file);
        }

        foreach ($configLocations as $configFile) {
            if (file_exists($configFile)) {
                break;
            }
        }

        if (!file_exists($configFile)) {
            throw new InvalidArgumentException('Configuration does not exist!' . PHP_EOL);
        }

        $config = parse_ini_file($configFile, true, INI_SCANNER_TYPED);
        $config['config_file'] = $configFile;

        if (!is_array($config)) {
            throw new RuntimeException('Failed to load configuration file!' . PHP_EOL);
        }

        return $config;
    }

    /**
     * @param string $xml
     *
     * @return SimpleXMLElement
     */
    private function parseXML($xml)
    {
        $xml = simplexml_load_string($xml);
        if ($xml === false) {
            $errors = '';
            foreach (libxml_get_errors() as $error) {
                $errors .= ' ' . $error->message;
            }

            throw new RuntimeException('Failed loading XML:' . $errors);
        }

        return $xml;
    }

    /**
     * Run the app
     */
    public function run()
    {
        if (!is_numeric($this->user_id)) {
            throw new InvalidArgumentException('User ID not provided or is invalid!');
        }

        $params = '';
        foreach ($this->options as $var => $val) {
            if (in_array($var, ['user_id', 'schedule'])) {
                continue;
            }

            if (!empty($params)) {
                $params .= '&';
            }

            if (is_bool($val)) {
                $val = ($val ? 'true' : 'false');
            }

            $params .= $var . '=' . $val;
        }

        $schedule_only_mode = isset($this->options['schedule']) && $this->options['schedule'] === true;

        try {
            if ($schedule_only_mode) {
                $response = $this->httpClient->get(self::XML_ENDPOINT . '/user/schedule/' . $this->user_id . '.rss');
            } else {
                $response = $this->httpClient->get(self::XML_ENDPOINT . '/user/' . $this->user_id . '.rss' . '?' . $params);
            }
        } catch (HttpException $e) {
            echo 'ERROR - ' . $e->getMessage() . PHP_EOL;

            exit(1);
        }

        if ($response->getStatusCode() === 200) {
            $data = $this->parseXML($response->getBody());

            if (isset($data->channel)) {
                $newEpisodes = [];
                foreach ($data->channel->item as $item) {
                    $date = new DateTime($item->pubDate);
                    $date->setTimezone(new DateTimeZone(date_default_timezone_get()));

                    $now = new DateTime('now');

                    if ($date > $now) {
                        continue;
                    }

                    $newEpisodes[] = [
                        'title'       => (string) $item->title,
                        'description' => (string) $item->description,
                        'link'        => (string) $item->link,
                        'show_id'     => (int) $item->children('tv', true)->show_id,
                        'episode_id'  => (int) $item->children('tv', true)->episode_id,
                    ];
                }

                $this->loadFromCache();

                if (!empty($newEpisodes) && (!isset($this->cache['last']) || serialize($this->cache['last']) !== serialize($newEpisodes))) {
                    if (isset($this->cache['last'])) {
                        foreach ($this->cache['last'] as $cached) {
                            foreach ($newEpisodes as $i => $newEpisode) {
                                if ($this->normalizeEpisodeTitle($cached['title']) === $this->normalizeEpisodeTitle($newEpisode['title'])) {
                                    unset($newEpisodes[$i]);
                                }
                            }
                        }
                    }

                    if ($this->putIntoCache($newEpisodes, 1000)) {
                        call_user_func($this->callback, $newEpisodes);

                        echo 'OK ' . count($newEpisodes) . PHP_EOL;
                    }
                } else {
                    echo 'NOPE' . PHP_EOL;
                }
            }
        }
    }

    /**
     * @return void
     */
    private function loadFromCache()
    {
        $cache = [];
        if (file_exists($this->cache_file)) {
            $cache = json_decode(file_get_contents($this->cache_file), true);

            if (!is_array($cache)) {
                $cache = [];
            }
        }

        $this->cache = $cache;
    }

    /**
     * @param array $merge
     * @param int   $capacity
     *
     * @return bool
     */
    private function putIntoCache(array $last = [], $capacity = 1000)
    {
        if (empty($this->cache)) {
            $this->loadFromCache();
        }

        $data['last'] = array_merge_recursive(isset($this->cache['last']) ? $this->cache['last'] : [], $last);

        if (count($data['last']) > $capacity) {
            $data['last'] = array_slice($data['last'], -$capacity);
        }

        $data['timestamp'] = time();

        if (@file_put_contents($this->cache_file, json_encode($data))) {
            return true;
        }

        echo 'ERROR - ' . error_get_last()['message'] . PHP_EOL;

        return false;
    }

    /**
     * @param string $title
     *
     * @return string
     */
    private function normalizeEpisodeTitle(string $title)
    {
        return trim(str_replace(['1080p', '720p'], '', $title));
    }
}

##############################################

$app = new showRSS($argv);
$app->run();
