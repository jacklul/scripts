#!/usr/bin/env php
<?php
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-updatelists-report.php
#
# To be used wit https://github.com/jacklul/pihole-updatelists
#
# Override pihole-updatelists.service:
#  [Service]
#  Type=oneshot
#  ExecStartPost=-/bin/sh -c "/usr/local/bin/telegram-notify --icon 1F4CA --title \"Pi-hole's Scheduled Lists Update @ %H\" --text \"$(/opt/helpers/pihole-updatelists-report.php)\" --html --silent"

$command = "journalctl _SYSTEMD_INVOCATION_ID=$(systemctl show -p InvocationID --value pihole-updatelists.service)";
$output = shell_exec($command);

if (empty($output)) {
	echo 'Failed to execute journalctl command or read and parse the log!' . PHP_EOL;
	die();
}

$anyOutput = false;
foreach (['ADLISTS', 'WHITELIST', 'REGEX_WHITELIST', 'BLACKLIST', 'REGEX_BLACKLIST'] as $type) {
	preg_match_all('/Fetching (' . $type . ').*\((\d+ entries)\).*Processing\.{3} (.*)$/Ums', $output, $matches);

	if (isset($matches[1][0])) {
		echo ucwords(strtolower(str_replace('_', ' ', $matches[1][0]))) . ' - ' . $matches[2][0] . ' - ' . $matches[3][0] . PHP_EOL;
		$anyOutput = true;
	}
}

if ($anyOutput) {
	echo PHP_EOL;
}

preg_match_all('/Number of .*/', $output, $matches);
echo implode(PHP_EOL, $matches[0]) . PHP_EOL;

preg_match_all('/Finished.*seconds.*\n.*Neutrino emissions detected/', $output, $matches);

// pihole updateGravity ran after pihole-updatelists finished
if (!empty($matches[0])) {
	preg_match_all('/([a-zA-Z]+ \d{1,2} \d{1,2}:\d{1,2}:\d{1,2}) [a-zA-Z]+ .*\:/', $output, $matches);

	if (isset($matches[1][0])) {
		$first = $matches[1][0];
		$last = $matches[1][count($matches[1]) - 1];

		$seconds = (new DateTime($last))->getTimestamp() - (new DateTime($first))->getTimestamp(); 

		echo PHP_EOL . 'Finished in ' . $seconds . ' seconds.' . PHP_EOL;
	}
} else {
	preg_match_all('/Finished.*seconds/', $output, $matches);
	echo PHP_EOL . implode(PHP_EOL, $matches[0]) . PHP_EOL;
}
