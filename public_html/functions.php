<?php

$debug = true;

if ($debug) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

$dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
    PDO::ATTR_PERSISTENT => true,
    PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
));

session_start();

function _esc($variable)
{
    return htmlspecialchars($variable);
}

function _pr($variable)
{
    echo htmlspecialchars($variable);
}

function redirect($url, $statusCode = 303)
{
    header('Location: ' . $url, true, $statusCode);
    die();
}

/* pretty print */

function pp($var)
{
    print '<pre>';
    print_r($var);
    print '</pre>';
}

/* die and pretty print */

function dpp($var) {
    pp($var);
    die();
}

function checkUserExists($username) {

    global $dbh;

    $checkUserExists = $dbh
        ->prepare('SELECT count(1) userExists FROM users WHERE username = ?');

    $checkUserExists->execute([$username]);

    return $checkUserExists->fetch()['userExists'];
}

function getLoggedInUserId() {
    return $_SESSION['id'];
}

function printMessages($messages) {
    foreach($messages as $message): ?>
        <div class="alert alert-danger"><?php _pr($message['msg']) ?></div>
    <?php endforeach;
}

function isAnyEmpty() {
    
    foreach(func_get_args() as $arg)
        if(empty($arg))
            return true;

    return false;
}

function goHomeIfNotLoggedIn() {
    if(!isset($_SESSION['loggedIn'])) {
        redirect("index.php");
    }
}

function isAnybodyLoggedIn() {
    return isset($_SESSION['loggedIn']);
}