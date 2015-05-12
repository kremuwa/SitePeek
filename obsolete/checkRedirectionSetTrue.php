<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-07
 * Time: 11:38
 */

error_reporting(-1); // DEBUG

try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
    ));

    $sql = "UPDATE playgrounds (redirectionCheck)
            VALUES (1)";

    $stmt = $dbh->prepare($sql);

    $stmt->execute();

} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . '<br />'; // DEBUG
    // print "Something went wrong"; // PRODUCTION
    die();
}