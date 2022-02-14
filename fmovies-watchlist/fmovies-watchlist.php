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
    public function __construct(string $message = null, int $code = 0, Exception $previous = null, HttpResponse $response = null)
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

final class FMoviesNotify
{
    /**
     * @var string
     */
    private $endpoint = 'https://fmovies.to';

    /**
     * @var array
     */
    private $config;

    /**
     * @var HttpClient
     */
    private $http;

    /**
     * @var string
     */
    private $config_file;

    /**
     * @var array
     */
    private $local_data = [];

    /**
     * @var int
     */
    private $last_request = 0;

    /**
     * @var int
     */
    private $last_notification = 0;

    /**
     * @param array $args
     */
    public function __construct(array $args)
    {
        $this->config = $this->loadConfigFile($args[1] ?? null);

        if (isset($this->config['debug'])) {
            $configTmp                        = $this->config;
            $configTmp['fmovies']['username'] = '(len = ' . strlen($configTmp['fmovies']['username']) . ')';
            $configTmp['fmovies']['password'] = '(len = ' . strlen($configTmp['fmovies']['password']) . ')';

            ob_start();
            var_dump($configTmp);
            print('Configuration (' . $this->config_file . '): ' . preg_replace('/=>\s+/', ' => ', ob_get_clean()));
        }

        if (isset($this->config['fmovies']['endpoint'])) {
            $this->endpoint = $this->config['fmovies']['endpoint'];
        }

        if (file_exists($this->config['fmovies']['data_file'])) {
            $data = json_decode(file_get_contents($this->config['fmovies']['data_file']), true);

            if (is_array($data)) {
                $this->local_data = $data;

                isset($this->config['debug']) && print('Loaded local data' . PHP_EOL);
            }
        }

        $httpOptions = [
            'timeout' => 60,
        ];

        if (!empty($this->config['http'])) {
            foreach ($this->config['http'] as $var => $val) {
                $httpOptions[$var] = $val;
            }
        }

        $this->http = new HttpClient($httpOptions);
    }

    /**
     * Run the app
     */
    public function run(): void
    {
        if (!$this->login()) {
            exit(1);
        }

        $page      = 1;
        $retry     = 0;
        $watchlist = [];

        while ($retry < 3) {
            isset($this->config['debug']) && print('Fetching watchlist page ' . $page . ' (attempt ' . ($retry + 1) . ')' . PHP_EOL);

            $data = $this->request($this->endpoint . '/user/watchlist?page=' . $page);

            if ($data !== null) {
                preg_match_all('/data-id="(?P<id>.*)".*class="quality">(?P<quality>.*)<\/.*<h3>.*title="(?P<title>.*)".*href="(?P<url>.*)".*<\/h3>.*"meta"> (?P<season>.*) <.*> (?P<episode>.*) <.*class="type">(?P<type>.*)<\//U', $data, $matches); // Regex time: 12-06-2021

                if (isset($matches[0]) && count($matches[0]) > 0) {
                    for ($i = 0, $iMax = count($matches[0]); $i < $iMax; $i++) {
                        $matches['title'][$i] = html_entity_decode($matches['title'][$i], ENT_QUOTES);

                        if ($matches['type'][$i] !== 'TV') {
                            $matches['season'][$i]  = null;
                            $matches['episode'][$i] = null;
                        }

                        $watchlist[$matches['id'][$i]] = [
                            'id'      => $matches['id'][$i],
                            'title'   => $matches['title'][$i],
                            'url'     => $this->endpoint . '/' . ltrim(explode('?', $matches['url'][$i])[0], '/'),
                            'type'    => in_array($matches['type'][$i], ['TV', 'Movie']) ? $matches['type'][$i] : 'Unknown',
                            'quality' => in_array($matches['quality'][$i], ['HD', 'HDRip', 'SD', 'TS', 'CAM']) ? $matches['quality'][$i] : 'Unknown',
                            'season'  => $matches['season'][$i] !== null ? trim(str_replace('SS', '', $matches['season'][$i])) : null,
                            'episode' => $matches['episode'][$i] !== null ? trim(str_replace('EP', '', $matches['episode'][$i])) : null,
                        ];

                        isset($this->config['debug']) && print('Parsed: ' . $matches['title'][$i] . PHP_EOL);
                    }
                } elseif ($page === 1) {
                    $retry++;

                    if ($retry >= 3) {
                        echo 'Watchlist is empty or data could not be parsed!' . PHP_EOL;
                        break; // No results due to parse error
                    }

                    continue;
                } else {
                    isset($this->config['debug']) && print('No more results' . PHP_EOL);
                    break; // No more results
                }

                $page++;
                $retry = 0;
            } else {
                $retry++;
            }
        }

        $format_tv    = $this->config['fmovies']['format_tv'];
        $format_movie = $this->config['fmovies']['format_movie'];
        $quality      = strtolower($this->config['fmovies']['quality']);

        $addedEntries   = 0;
        $removedEntries = 0;
        $newReleases    = [];

        if (isset($this->local_data['watchlist'])) {
            foreach ($watchlist as $id => $data) {
                if (!isset($this->local_data['watchlist'][$id])) {
                    $addedEntries++;
                }
            }

            foreach ($this->local_data['watchlist'] as $id => $data) {
                if (!isset($watchlist[$id])) {
                    $removedEntries++;
                }
            }

            foreach ($this->local_data['watchlist'] as $local_data_id => $local_data_data) {
                if (isset($watchlist[$local_data_id])) {
                    if (
                        $local_data_data['type'] == 'TV' &&
                        $this->isNewEpisode($watchlist[$local_data_id], $local_data_data, $quality)
                    ) {
                        $newReleases[] = [
                            'title' => str_replace(
                                ['#TITLE#', '#QUALITY#', '#SEASON#', '#EPISODE#', '#SEASONP#', '#EPISODEP#'],
                                [
                                    $watchlist[$local_data_id]['title'],
                                    $watchlist[$local_data_id]['quality'],
                                    $watchlist[$local_data_id]['season'],
                                    $watchlist[$local_data_id]['episode'],
                                    sprintf('%02d', $watchlist[$local_data_id]['season']),
                                    sprintf('%02d', $watchlist[$local_data_id]['episode']),
                                ],
                                $format_tv
                            ),
                            'url'   => $watchlist[$local_data_id]['url'],
                        ];
                    } elseif (
                        $local_data_data['type'] == 'Movie' &&
                        $this->isMovieQualityFine($watchlist[$local_data_id], $local_data_data, $quality)
                    ) {
                        $newReleases[] = [
                            'title' => str_replace(
                                ['#TITLE#', '#QUALITY#'],
                                [
                                    $watchlist[$local_data_id]['title'],
                                    $watchlist[$local_data_id]['quality'],
                                ],
                                $format_movie
                            ),
                            'url'   => $watchlist[$local_data_id]['url'],
                        ];
                    }
                }
            }
        }

        // If nothing failed to download overwrite local watchlist to have 1:1 sync, otherwise merge with existing data to prevent state loss
        if (!$this->saveState($watchlist, $retry < 3)) {
            exit(1);
        }

        if (!empty($this->local_data)) {
            if (count($newReleases) > 0) {
                $this->notify($newReleases);
        
                echo 'Found ' . count($newReleases) . ' new release(s)' . PHP_EOL;
            } else {
                echo 'No new releases found' . PHP_EOL;
            }
        }

        if (empty($this->local_data)) {
            $addedEntries = count($watchlist);
        }

        if ($addedEntries > 0 || ($removedEntries > 0 && $retry < 3)) {
            $local_data = [];

            if ($addedEntries > 0) {
                $local_data[] = 'added ' . $addedEntries . ' entries';
            }

            if ($removedEntries > 0) {
                $local_data[] = 'removed ' . $removedEntries . ' entries';
            }

            echo 'Synchronized watchlist - ' . implode(', ', $local_data) . PHP_EOL;
        }

        if ($retry >= 3) {
            exit(1);
        }
    }

    /**
     * @param string $config_file
     *
     * @return string
     */
    private function findConfigFile(string $config_file = null): string
    {
        $configLocations = [
            __DIR__ . '/fmovies-watchlist.conf',
        ];

        if (isset($_SERVER['HOME'])) {
            $configLocations = array_merge($configLocations, [
                $_SERVER['HOME'] . '/.config/fmovies-watchlist/fmovies-watchlist.conf',
                $_SERVER['HOME'] . '/.config/fmovies-watchlist.conf',
            ]);
        }

        if ($config_file !== null && file_exists($config_file)) {
            array_unshift($configLocations, $config_file);
        }

        foreach ($configLocations as $configFile) {
            if (file_exists($configFile)) {
                break;
            }
        }

        if (!file_exists($configFile)) {
            echo 'Configuration file does not exist!' . PHP_EOL;
            exit(1);
        }

        return $configFile;
    }

    /**
     * @var string $config_file
     *
     * @return array
     */
    private function loadConfigFile(string $config_file = null): array
    {
        $config_file = $this->findConfigFile($config_file);

        if (!file_exists($config_file)) {
            throw new RuntimeException('Configuration does not exist!' . PHP_EOL);
        }

        $this->config_file = $config_file;
        $config            = parse_ini_file($config_file, true, INI_SCANNER_TYPED);

        if (!is_array($config)) {
            throw new RuntimeException('Failed to load configuration file!' . PHP_EOL);
        }

        if (isset($config['fmovies']['data_file'])) {
            if (!is_dir(dirname($config['fmovies']['data_file']))) {
                mkdir(dirname($config['fmovies']['data_file']), 0750, true);
            }
        } else {
            $config['fmovies']['data_file'] = dirname($config_file) . DIRECTORY_SEPARATOR . str_replace('-', '_', pathinfo($config_file, PATHINFO_FILENAME)) . '_data.json';
        }

        $defaults = [
            'notification' => [
                'command'   => null,
                'maxlength' => 1024,
                'format'    => '#TITLE# - #URL#',
                'failure_timeout' => 24 * 3600,
            ],
            'fmovies'      => [
                'endpoint'     => $this->endpoint,
                'username'     => null,
                'password'     => null,
                'data_file'    => dirname($config_file) . DIRECTORY_SEPARATOR . 'fmovies_watchlist_data.json',
                'format_tv'    => '#TITLE# #SEASON#x#EPISODEP# #QUALITY#',
                'format_movie' => '#TITLE# #QUALITY#',
                'quality'      => 'HD',
            ],
            'http'         => [
                'user_agent' => 'FMovies Watchlist Checker [' . (function_exists('curl_version') ? 'curl/' . curl_version()['version'] . ' ' : '') . 'PHP/' . PHP_VERSION . ']',
            ],
        ];

        foreach ($defaults as $group => $group_data) {
            foreach ($group_data as $var => $val) {
                if (!isset($config[$group][$var])) {
                    $config[$group][$var] = $val;
                }
            }
        }

        return $config;
    }

    /**
     * @return bool
     */
    private function login(): bool
    {
        try {
            $options = [
                'form_params' => [
                    'username' => $this->config['fmovies']['username'],
                    'password' => $this->config['fmovies']['password'],
                    'remember' => 'on',
                ],
                'headers'     => [
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Referer'          => $this->endpoint . '/',
                    'Content-Type'     => 'application/x-www-form-urlencoded',
                ],
            ];

            $response = $this->http->post($this->endpoint . '/ajax/user/login', $options);
            $body     = $response->getBody();
            $json     = json_decode($body, true);

            if (is_array($json)) {
                if (isset($json['success']) && $json['success'] === true) {
                    isset($this->config['debug']) && print('Successfully logged in' . PHP_EOL);

                    return true;
                } elseif (isset($json['message'])) {
                    throw new HttpException('Site error: ' . $json['message'], 0, null, $response);
                } elseif (isset($json['messages'])) {
                    throw new HttpException(implode(' | ', $json['messages']), 0, null, $response);
                } else {
                    throw new HttpException('Unhandled error', 0, null, $response);
                }
            } else {
                throw new HttpException('Not a JSON response', 0, null, $response);
            }
        } catch (HttpException $e) {
            echo 'ERROR - ' . $e->getMessage() . PHP_EOL;

            $this->notifyAboutError($e->getMessage());
        }

        return false;
    }

    /**
     * @param string $url
     *
     * @return string|null
     */
    private function request(string $url): ?string
    {
        if ($this->last_request !== 0 && time() < $this->last_request + 1) {
            sleep(1);
        }
        $this->last_request = time();

        try {
            $response = $this->http->get($url);

            if (substr($response->getBody(), 0, 2) === '{"') {
                $json = json_decode($response->getBody(), true);

                if (isset($json['message'])) {
                    throw new HttpException('Site error: ' . $json['message'], 0, null, $response);
                } elseif (isset($json['messages'])) {
                    throw new HttpException(implode(' | ', $json['messages']), 0, null, $response);
                }
            }

            return $response->getBody();
        } catch (HttpException $e) {
            echo 'ERROR - ' . $e->getMessage() . PHP_EOL;

            $this->notifyAboutError($e->getMessage());
        }

        return null;
    }

    /**
     * @param array $watchlist
     * @param array $overwrite
     *
     * @return bool
     */
    private function saveState(array $watchlist = [], bool $overwrite = false): bool
    {
        if ($overwrite === false) {
            $watchlist = array_merge(isset($this->local_data['watchlist']) ? $this->local_data['watchlist'] : [], $watchlist);
        }

        $data = [
            'watchlist' => $watchlist,
            'timestamp' => time(),
        ];

        if (@file_put_contents($this->config['fmovies']['data_file'], json_encode($data))) {
            return true;
        }

        echo 'ERROR - ' . error_get_last()['message'] . PHP_EOL;

        return false;
    }

    /**
     * @param array $episodes
     *
     * @return void
     */
    private function notify(array $episodes): void
    {
        if (count($episodes) === 0) {
            return;
        }

        $maxlength = is_numeric($this->config['notification']['maxlength']) ? $this->config['notification']['maxlength'] : 1024;

        $notification = '';
        foreach ($episodes as $episode) {
            $thisNotification = str_replace(['#TITLE#', '#URL#'], [$episode['title'], $episode['url']], $this->config['notification']['format']) . PHP_EOL;

            $notificationTmp = $notification;
            $notificationTmp .= $thisNotification;

            if (strlen($notificationTmp) >= $maxlength) {
                $this->sendNotification($notification);
                $notification = '';
            }

            $notification .= $thisNotification;
        }

        if (!empty($notification)) {
            $this->sendNotification($notification);
        }
    }

    /**
     * @param string $text
     *
     * @return void
     */
    private function sendNotification(string $text): void {
        if (isset($this->config['notification']['command'])) {
            if (time() < $this->last_notification + 1) {
                sleep(1);
            }

            $command = trim(
                str_replace(
                    '#TEXT#',
                    str_replace('"', '\"', trim($text)),
                    $this->config['notification']['command']
                )
            );

            if (isset($this->config['notification']['debug'])) {
                echo $command . PHP_EOL;
            }

            if (stripos(PHP_OS, 'WIN') !== 0) {
                system($command);

                $this->last_notification = time();
            } elseif (isset($this->config['debug'])) {
                echo 'Command: ' . $command . PHP_EOL;
            } else {
                throw new RuntimeException('Unable to run command through system() - unsupported OS!');
            }
        } else {
            echo PHP_EOL . $text . PHP_EOL;
        }
    }

    /**
     * @param string $message
     *
     * @return void
     */
    private function notifyAboutError(string $message): void
    {
        $last_failure_timestamp_previous = $this->local_data['last_failure_timestamp'] ?? null;
        $last_failure_message_previous = $this->local_data['last_failure_message'] ?? null;

        if (isset($this->local_data['last_failure_timestamp']) && $this->local_data['last_failure_timestamp'] + $this->config['notification']['failure_timeout'] < time() ) {
            $this->local_data['last_failure_timestamp'] = time();

            echo 'Sending notification about the error...' . PHP_EOL;

            $this->sendNotification('Script encountered an error: ' . $message);
        } elseif (!isset($this->local_data['last_failure_timestamp']) || $this->local_data['last_failure_timestamp'] === null) {
            $this->local_data['last_failure_timestamp'] = time();
        }

        $this->local_data['last_failure_message'] = $message;

        if (
            $this->local_data['last_failure_timestamp'] !== $last_failure_timestamp_previous ||
            $this->local_data['last_failure_message'] !== $last_failure_message_previous
        ) {
            if (!@file_put_contents($this->config['fmovies']['data_file'], json_encode($this->local_data))) {
                echo 'ERROR - ' . error_get_last()['message'] . PHP_EOL;
                exit(1);
            }
        }
    }

    /**
     * @param string $current
     * @param string $minimum
     *
     * @return boolean
     */
    private function isMinimumQuality(string $current, string $minimum)
    {
        $current = strtolower($current);
        $minimum = strtolower($minimum);

        $qualities = [
            'CAM',
            'TS',
            'SD',
            'HDRip',
            'HD',
        ];

        $minimumReached = false;
        foreach ($qualities as $quality) {
            $quality = strtolower($quality);

            if ($quality === $minimum) {
                $minimumReached = true;
            }

            if ($minimumReached === true && $quality === $current) {
                return true;
            }
        }

        return false;
    }
    
    /**
     * @param array  $watchlist_data
     * @param array  $local_data
     * @param string $minimum_quality
     *
     * @return boolean
     */
    private function isNewEpisode(array $watchlist_data, array $local_data, string $minimum_quality)
    {
        $watchlist_data['quality'] = strtolower($watchlist_data['quality']);
        $local_data['quality'] = strtolower($local_data['quality']);

        if (
            (
                (
                    $watchlist_data['season'] > $local_data['season'] ||
                    $watchlist_data['episode'] > $local_data['episode']
                ) &&
                (
                    $minimum_quality === 'any' ||
                    $this->isMinimumQuality($watchlist_data['quality'], $minimum_quality)
                )
            ) ||
            (
                $minimum_quality !== 'any' &&
                $this->isMinimumQuality($watchlist_data['quality'], $minimum_quality) &&
                $watchlist_data['quality'] !== $local_data['quality']
            )
        ) {
            return true;
        }

        return false;
    }


    /**
     * @param array  $watchlist_data
     * @param array  $local_data
     * @param string $minimum_quality
     *
     * @return boolean
     */
    private function isMovieQualityFine(array $watchlist_data, array $local_data, string $minimum_quality)
    {
        $watchlist_data['quality'] = strtolower($watchlist_data['quality']);
        $local_data['quality'] = strtolower($local_data['quality']);

        if (
            $minimum_quality !== 'any' &&
            (
                $this->isMinimumQuality($watchlist_data['quality'], $minimum_quality) &&
                $watchlist_data['quality'] !== $local_data['quality']
            )
        ) {
            return true;
        }

        return false;
    }
}

set_exception_handler(function (\Exception $exception) {
    echo 'Uncaught exception in ' . basename($exception->getFile()) . ':' . $exception->getLine() . ' - ' . trim($exception->getMessage()) . PHP_EOL;
});

##############################################

$app = new FMoviesNotify($argv);
$app->run();
