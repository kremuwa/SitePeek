<?php

    error_reporting(-1); // DEBUG

    $frames = json_decode($_POST['frames']);

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        $dbh->beginTransaction();

        foreach($frames as $x) {

            // DB columns have different names for "security by obscurity"

            $stmt = $dbh->prepare("INSERT INTO frames (frameType, frameTimestamp, frameMouseX, frameMouseY, frameScrollTop) VALUES (?, ?, ?, ?, ?)");

            $stmt->bindValue(1, $x->type);
            $stmt->bindValue(2, $x->timestamp);
            $stmt->bindValue(3, (isset($x->mouseX) ? $x->mouseX : NULL));
            $stmt->bindValue(4, (isset($x->mouseY) ? $x->mouseY : NULL));
            $stmt->bindValue(5, (isset($x->scrollTop) ? $x->scrollTop : NULL));

            $stmt->execute();

        }

        $dbh->commit();

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "`omething went wrong"; // PRODUCTION
        die();
    }