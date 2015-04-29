<?php

    error_reporting(-1);

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        $dbh->beginTransaction();

        $stmt = $dbh->prepare("INSERT INTO frames (mouseX, mouseY) VALUES (?, ?)");
        $stmt->bindParam(1, $_POST['mouseX']);
        $stmt->bindParam(2, $_POST['mouseY']);

        $stmt->execute();

        $dbh->commit();

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "Something went wrong"; // PRODUCTION
        die();
    }