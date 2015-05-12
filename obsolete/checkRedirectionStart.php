<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-07
 * Time: 10:51
 */

    error_reporting(-1); // DEBUG

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        $sql = "INSERT INTO playgrounds (playgroundID, url)
                VALUES (?, ?)";

        $stmt = $dbh->prepare($sql);

        $stmt->execute(array($_POST['playgroundID'], $_POST['url']));

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "Something went wrong"; // PRODUCTION
        die();
    }

?>

<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>

    <script>

        window.onbeforeunload = function() {

            $.ajax({

                url: 'ajax/checkRedirectionSetTrue.php',

                async: false,

                type: 'POST'

            });

            return 'Just a second!';
        }

    </script>

    <iframe src="<?php $_POST['url'] ?>"></iframe>

</body>
</html>