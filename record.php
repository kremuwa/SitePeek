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

        <iframe id="recordingFrame" src="<?php echo $result['url']; ?>"></iframe>