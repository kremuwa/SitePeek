<?php

try {
    $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
    ));

    $sql = "SELECT url
            FROM playgrounds
            WHERE playgroundID = ?";

    $stmt = $dbh->prepare($sql);

    $stmt->execute(array($_GET['id']));

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

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
                If You would also like to make fun of spying on somebody, go to SitePeek.com or just stay
                on this page and <!-- DEBUG --><a id="createYourOwn" href=".">click here</a> :)
            </p>

        </div>