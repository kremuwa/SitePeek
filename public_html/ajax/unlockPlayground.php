<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-06-09
 * Time: 14:02
 */

error_reporting(-1); //DEBUG

try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
    ));

    $sql =
        "UPDATE playgrounds
        SET recording = '0'
        WHERE playgroundId = ?";

    $stmt = $dbh->prepare($sql);

    $stmt->execute(array($_POST['playgroundId']));

} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . '<br />'; // DEBUG
    // print "Something went wrong"; // PRODUCTION
    die();
}
