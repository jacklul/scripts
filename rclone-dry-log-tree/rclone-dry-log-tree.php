<?php

$dataFile = __DIR__ . '/' . basename(__FILE__, '.php') . '.json';
$cacheFile = __DIR__ . '/' . basename(__FILE__, '.php') . '.cache';

if (isset($_SERVER['HOME']) && is_dir($_SERVER['HOME'] . '/.cache')) {
	$dataFile = $_SERVER['HOME'] . '/.cache/' . basename(__FILE__, '.php') . '.json';
	$cacheFile = $_SERVER['HOME'] . '/.cache/' . basename(__FILE__, '.php') . '.cache';
}

if (php_sapi_name() === 'cli') {
    if ($argc < 2) {
        echo 'Usage: rclone-log-to-tree.php <rclone.log>' . PHP_EOL;
        exit(1);
    }

    if (file_exists($argv[1])) {
        if (!$handle = fopen($argv[1], 'r')) {
            echo 'Cannot open file (' . $argv[1] . ')' . PHP_EOL;
            exit(1);
        }
    } else {
        echo 'Log file does not exist' . PHP_EOL;
        exit(1);
    }

    $files = [];
    $longestPath = [];
    $longestFiles = [];
    $maxEntries = 25;

    while (($line = fgets($handle)) !== false) {
        if (preg_match('/NOTICE: (.*): Skipped.*\(size (.*)i?\)/', $line, $matches)) {
            $file = '/' . $matches[1];
            $size = $matches[2];

            if (!is_numeric($matches[2])) {
                $multiply = 1024;

                if (substr($matches[2], -2) == 'Ki') {
                    $size = substr($matches[2], 0, -2) * $multiply;
                } elseif (substr($matches[2], -2) == 'Mi') {
                    $size = substr($matches[2], 0, -2) * $multiply * $multiply;
                } elseif (substr($matches[2], -2) == 'Gi') {
                    $size = substr($matches[2], 0, -2) * $multiply * $multiply * $multiply;
                }
            }

            $files[$file] = $size = round($size);
            $countLongestPath = count($longestPath);
            $countLongestFiles = count($longestFiles);
            $filetest = '/' . str_repeat(' ', 10) . $file;

            if (($countLongestPath === 0 && strlen($filetest) > 128) || ($countLongestPath > 0 && strlen($filetest) > strlen($longestPath[$countLongestPath - 1]))) {
                $longestPath[] = $filetest;

                if ($countLongestPath > $maxEntries) {
                    array_shift($longestPath);
                }
            }

            if ($countLongestFiles === 0 && strlen(basename($file)) > 143) {
                $longestFiles[] = $filetest;

                if ($countLongestFiles > $maxEntries) {
                    array_shift($longestFiles);
                }
            }
        }
    }

    fclose($handle);
    echo "Total: " . count($files) . PHP_EOL;
    file_put_contents($dataFile, json_encode($files));
    echo PHP_EOL . 'Longest paths: ';
    print_r($longestPath);
    echo PHP_EOL . 'Files exceeding 143 character length: ';
    print_r($longestFiles);

    exit(0);
}

function formatBytes($bytes, $precision = 2) { 
    $units = array('B', 'KB', 'MB', 'GB', 'TB'); 

    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 
    $bytes /= pow(1024, $pow);

    return round($bytes, $precision) . ' ' . $units[$pow]; 
}

if (!$dataFile) {
	echo 'No data file!' . PHP_EOL;
    exit(1);
}

$md5_current = md5_file($dataFile);
$files = json_decode(file_get_contents($dataFile), true);

$cache = null;
if (file_exists($cacheFile)) {
	$cache = json_decode(file_get_contents($cacheFile), true);

	if ($md5_current != $cache['md5']) {
		$cache = null;
	}
}

if ($cache === null) {
	$cache = [
		'md5' => $md5_current,
		'data' => [],
	];
}

$currentDir = ($_GET['path'] ?? '/');
$sortMode = ($_GET['sort'] ?? 'name');
$currentDirDepth = substr_count($currentDir, '/');

if (isset($cache['data'][sha1($currentDir . ' ' . $sortMode)])) {
	$filesListing = $cache['data'][sha1($currentDir . ' ' . $sortMode)]['filesListing'];
	$directoriesListing = $cache['data'][sha1($currentDir . ' ' . $sortMode)]['directoriesListing'];

	echo "<!-- read from cache -->" . PHP_EOL;
} else {
	$filesListing = [];
	$directoriesListing = [];
	foreach ($files as $file => $size) {
		if (substr($file, 0, strlen($currentDir)) == $currentDir) {
			if ($currentDirDepth === substr_count($file, '/')) {
				$filesListing[$file] = $size;
			} else {
				$dir = $currentDir . explode('/', $file)[$currentDirDepth] . '/';

				if (!isset($directoriesListing[$dir])) {
					$dirSize = 0;
					foreach ($files as $dfile => $dsize) {
						if (substr($dfile, 0, strlen($dir)) == $dir) {
							$dirSize += $dsize;
						}
					}

					$directoriesListing[$dir] = $dirSize;
				}
			}
		}
	}

	if (file_exists($cacheFile)) {
		$cache_current = json_decode(file_get_contents($cacheFile), true);

		if (isset($cache_current['data'])) {
			$cache = $cache_current;
		}

		unset($cache_current);
	}

	$cache['data'][sha1($currentDir . ' ' . $sortMode)]['filesListing'] = $filesListing;
	$cache['data'][sha1($currentDir . ' ' . $sortMode)]['directoriesListing'] = $directoriesListing;

	file_put_contents($cacheFile, json_encode($cache));
}

$upOneDir = explode('/', rtrim($currentDir, '/'));
array_pop($upOneDir);

echo '<style>body { font-size: 20px; }</style>';
echo 'Sort by: <a href="?path=' . $currentDir . '&sort=name">NAME</a> / <a href="?path=' . $currentDir . '&sort=size">SIZE</a> &nbsp; | &nbsp;  <a href="?bigfiles">SHOW BIGGEST FILES</a><br>';

if (isset($_GET['bigfiles'])) {
    arsort($files);

	echo '<hr><b>Files:</b><br>';

	foreach ($files as $file => $size) {
		if ($size < 1048576) {
			continue;
		}

		echo '<a href="C:' . dirname($file) . '">' . $file . '</a> (' . formatBytes($size) . ')<br>';
	}

	exit;
}

if ($sortMode === 'name') {
    ksort($directoriesListing, SORT_NATURAL);
    ksort($filesListing, SORT_NATURAL);
} elseif ($sortMode === 'size') {
    arsort($filesListing);
    arsort($directoriesListing);
}

echo '<hr><b>Directories:</b><br>';
echo '<a href="?path=' . urlencode(implode('/', $upOneDir)) . '/&sort=' . $sortMode . '">' . $currentDir . '..</a><br>';

foreach ($directoriesListing as $file => $size) {
    echo '<a href="?path=' . urlencode($file) . '&sort=' . $sortMode . '">' . $file . '</a> (' . formatBytes($size) . ')<br>';
}

echo '<hr><b>Files:</b><br>';

foreach ($filesListing as $file => $size) {
    echo '<a href="#">' . $file . '</a> (' . formatBytes($size) . ')<br>';
}
