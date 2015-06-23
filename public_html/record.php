<?php

try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
    ));

    $sql = "SELECT url, recording
            FROM playgrounds
            WHERE playgroundID = ?";

    $stmt = $dbh->prepare($sql);

    $stmt->execute(array($_GET['id']));

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // if there was no data with such id in the database, redirect to main site

    if($result == NULL)
        header('Location: .');

	// if we are not facebook crawler

	if(!stristr($_SERVER['HTTP_USER_AGENT'], 'FacebookExternalHit'))
	{

		// if someone is already recording in this playground, redirect
		// him to the homepage and notify the owner of playground of that fact

		if($result['recording']) {

			$sql =
				"INSERT INTO frames
				(playgroundId, frameType, frameTimestamp, frameMouseX, frameMouseY, frameTarget,
				 frameText, frameCaret, frameScrollTop, frameWidth, frameHeight, frameHref)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

			$stmt = $dbh->prepare($sql);

			$stmt->bindValue(1, $_GET['id']);
			$stmt->bindValue(2, 'secondvisitor');
			$stmt->bindValue(3, floor(microtime(true) * 1000));
			$stmt->bindValue(4, NULL);
			$stmt->bindValue(5, NULL);
			$stmt->bindValue(6, NULL);
			$stmt->bindValue(7, NULL);
			$stmt->bindValue(8, NULL);
			$stmt->bindValue(9, NULL);
			$stmt->bindValue(10, NULL);
			$stmt->bindValue(11, NULL);
			$stmt->bindValue(12, NULL);

			$res = $stmt->execute();

			header('Location: .');

			exit;
		}
		else { // in an opposite case, lock the playground
			$sql =
				"UPDATE playgrounds
				SET recording = '1'
				WHERE playgroundId = ?";

			$stmt = $dbh->prepare($sql);

			$stmt->execute(array($_GET['id']));
		}
	}

} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . '<br />'; // DEBUG
    // print "Something went wrong"; // PRODUCTION
    die();
}

?>

        <script>var playgroundId = '<?php echo $_GET['id']; ?>';</script>

        <iframe id="recording-frame" src="<?php echo $result['url']; ?>"></iframe>

        <div id="notification">

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

            <p>
                Surprise :D! Your friend played a joke on You! He sent You a
                very special link, and saw everything You were doing since You clicked on it.
                If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here :)</a>
            </p>

        </div>