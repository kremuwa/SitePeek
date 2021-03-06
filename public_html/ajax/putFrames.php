<?php

error_reporting(-1); // DEBUG
$frames = json_decode($_POST['frames']);
$testspaceId = $_POST['testspaceId'];
try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION /* DEBUG */
    ));
    $dbh->beginTransaction();
    foreach($frames as $x) {
        // DB columns have different names for "security by obscurity"
        $sql =
            "INSERT INTO frames
            (testspaceId, frameType, frameTimestamp, frameMouseX, frameMouseY, frameTarget,
             frameText, frameCaret, frameScrollTop, frameScrollLeft, frameWidth, frameHeight, frameHref)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $dbh->prepare($sql);
        $stmt->bindValue(1, $testspaceId);
        $stmt->bindValue(2, $x->type);
        $stmt->bindValue(3, $x->timestamp);
        $stmt->bindValue(4, (isset($x->mouseX) ? $x->mouseX : NULL));
        $stmt->bindValue(5, (isset($x->mouseY) ? $x->mouseY : NULL));
        $stmt->bindValue(6, (isset($x->target) ? $x->target : NULL));
        $stmt->bindValue(7, (isset($x->text) ? $x->text : NULL));
        $stmt->bindValue(8, (isset($x->caret) ? $x->caret : NULL));
        $stmt->bindValue(9, (isset($x->scrollTop) ? $x->scrollTop : NULL));
        $stmt->bindValue(10, (isset($x->scrollLeft) ? $x->scrollLeft : NULL));
        $stmt->bindValue(11, (isset($x->width) ? $x->width : NULL));
        $stmt->bindValue(12, (isset($x->height) ? $x->height : NULL));
        $stmt->bindValue(13, (isset($x->href) ? $x->href : NULL));
        $res = $stmt->execute();
    }
    $dbh->commit();
} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . '<br />'; // DEBUG
    // print "Something went wrong"; // PRODUCTION
    die();
}