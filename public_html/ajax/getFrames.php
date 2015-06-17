<?php

    // main code

    error_reporting(-1); //DEBUG

    $msecToLookBeforeLastAvailableFrame = 4000; // how long before the time of last available frame should we start
    $msecToLookBackForData = 10000; // how many msecs to look back from current time for frames

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        // if we're asking for data from preview-frame

        if($_POST['playgroundId'] == 'preview-frame') {

            $sql = "SELECT
                       frameType AS type, frameTimestamp AS timestamp, frameMouseX AS mouseX, frameMouseY AS mouseY,
                       frameTarget AS target, frameText AS text, frameCaret AS caret, frameScrollTop AS scrollTop,
                       frameWidth AS width, frameHeight AS height, frameHref AS href
                    FROM frames
                    WHERE playgroundId = ?";

            $stmt = $dbh->prepare($sql);
            $stmt->execute(array($_POST['playgroundId']));

        } else if ($_POST['lastTimestamp'] == 0) {

            // (I hope that in case of null in the subquery, the query will return nothing)
            // in subquery we look for the latest data, unless it's older than
            // $msecToLookBackForData and then we choose all frames that are more recent than the
            // found frame time - $msecToLookBeforeLastAvailableFrame
            // ASes provide security through obscurity, changing client-side names of properties

            $sql = "SELECT
                       frameType AS type, frameTimestamp AS timestamp, frameMouseX AS mouseX, frameMouseY AS mouseY,
                       frameTarget AS target, frameText AS text, frameCaret AS caret, frameScrollTop AS scrollTop,
                       frameWidth AS width, frameHeight AS height, frameHref AS href
                    FROM frames
                    WHERE playgroundId = ? AND frameTimestamp > (
                      SELECT MAX(frameTimestamp)
                      FROM frames
                      WHERE playgroundId = ? AND frameTimestamp > UNIX_TIMESTAMP(NOW()) * 1000 - $msecToLookBackForData
                    ) - $msecToLookBeforeLastAvailableFrame";

            $stmt = $dbh->prepare($sql);
            $stmt->execute(array($_POST['playgroundId'], $_POST['playgroundId']));

        } else {

            $sql = "SELECT
                      playgroundId,/*DEUBG*/ frameType AS type, frameTimestamp AS timestamp, frameMouseX AS mouseX, frameMouseY AS mouseY,
                       frameTarget AS target, frameText AS text, frameCaret AS caret, frameScrollTop AS scrollTop,
                       frameWidth AS width, frameHeight AS height, frameHref AS href
                    FROM frames
                    WHERE playgroundId = ? AND frameTimestamp > ?";

            $stmt = $dbh->prepare($sql);
            $stmt->execute(array($_POST['playgroundId'], $_POST['lastTimestamp']));

        }

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // let the client know that the result will be json (not sure if needed)
        header('Content-Type: application/json');

        // return JSON to Javascript
        echo json_encode($result);

        // removing obsolete frames (except when retrieved frames for preview-frame)

        if($_POST['playgroundId'] != 'preview-frame' && $_POST['lastTimestamp'] != 0) {

            $sql = "DELETE FROM frames
                    WHERE playgroundId = ? AND frameTimestamp <= ?";

            $stmt = $dbh->prepare($sql);
            $stmt->execute(array($_POST['playgroundId'], $_POST['lastTimestamp']));

        }

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "Something went wrong"; // PRODUCTION
        die();
    }