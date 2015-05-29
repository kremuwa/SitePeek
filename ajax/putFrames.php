<?php

    error_reporting(-1); // DEBUG

    $frames = json_decode($_POST['frames']);
    $playgroundId = $_POST['playgroundId'];

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        $dbh->beginTransaction();

        foreach($frames as $x) {

            // DB columns have different names for "security by obscurity"

            $sql =
            "INSERT INTO frames
            (playgroundId, frameType, frameTimestamp, frameMouseX, frameMouseY, frameTarget,
             frameText, frameCaret, frameScrollTop, frameWidth, frameHeight, frameHref)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


            $stmt = $dbh->prepare($sql);

            $stmt->bindValue(1, $playgroundId);
            $stmt->bindValue(2, $x->type);
            $stmt->bindValue(3, $x->timestamp);
            $stmt->bindValue(4, (isset($x->mouseX) ? $x->mouseX : NULL));
            $stmt->bindValue(5, (isset($x->mouseY) ? $x->mouseY : NULL));
            $stmt->bindValue(6, (isset($x->target) ? $x->target : NULL));
            $stmt->bindValue(7, (isset($x->text) ? $x->text : NULL));
            $stmt->bindValue(8, (isset($x->caret) ? $x->caret : NULL));
            $stmt->bindValue(9, (isset($x->scrollTop) ? $x->scrollTop : NULL));
            $stmt->bindValue(10, (isset($x->width) ? $x->width : NULL));
            $stmt->bindValue(11, (isset($x->height) ? $x->height : NULL));
            $stmt->bindValue(12, (isset($x->href) ? $x->href : NULL));

            $stmt->execute();

        }

        $dbh->commit();

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "`omething went wrong"; // PRODUCTION
        die();
    }