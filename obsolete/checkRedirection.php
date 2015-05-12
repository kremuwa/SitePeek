<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-07
 * Time: 17:50
 */


// run headless browser to test if the page redirects in first 5 seconds (details inside js file)


// TODO I have a security hole here, as HTTP_HOST can be changed in HTTP request

error_reporting(-1);

$pathToIframeWrapper = dirname(dirname("http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]")) . "/phantomjs/iframeWrapper.php";

$result = shell_exec("phantomjs ../phantomjs/checkRedirection.js $pathToIframeWrapper " . $_GET['url']);


echo "result: " . $result;