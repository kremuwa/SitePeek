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

            // db columns have different names for "security by obscurity"

            $stmt = $dbh->prepare("INSERT INTO frames (frameTimestamp, frameMouseX, frameMouseY) VALUES (?, ?, ?)");
            $stmt->bindParam(1, $x->timestamp);
            $stmt->bindParam(2, $x->mouseX);
            $stmt->bindParam(3, $x->mouseY);

            $stmt->execute();

        }

        $dbh->commit();

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "Something went wrong"; // PRODUCTION
        die();
    }