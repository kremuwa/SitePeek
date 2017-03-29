<?php

error_reporting(-1); //DEBUG

$testspaceId = uniqid();

try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
    ));

    $sql = "INSERT INTO testspaces (testspaceId, url)
            VALUES (?, ?)";

    $stmt = $dbh->prepare($sql);

    $stmt->execute(array($testspaceId, $_POST['url']));

    // return new testspaceId to javascript

    echo $testspaceId;

} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . '<br />'; // DEBUG
    // print "Something went wrong"; // PRODUCTION
    die();
}
