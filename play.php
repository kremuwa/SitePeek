<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-29
 * Time: 10:53
 */

    $playgroundId = uniqid();
    $url = 'wp';

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=peek_db', 'peek-user', 'B7FpQbpD6auDK2mr', array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING /* DEBUG */
        ));

        $sql = "INSERT INTO playgrounds (playgroundId, url)
                VALUES (?, ?)";

        $stmt = $dbh->prepare($sql);

        $stmt->execute(array($playgroundId, $url));

    } catch (PDOException $e) {
        print "Error: " . $e->getMessage() . '<br />'; // DEBUG
        // print "Something went wrong"; // PRODUCTION
        die();
    }

    function grabCurrentURL() {
        if (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {
            $url = "https://";
        }else{
            $url = "http://";
        }
        $url .= $_SERVER['SERVER_NAME'];
        if($_SERVER['SERVER_PORT'] != 80){
            $url .= ":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
        }else{
            $url .= $_SERVER["REQUEST_URI"];
        }
        return $url;
    }

?>


    <script>var playgroundId = '<?php echo $playgroundId; ?>';</script>

    <p>Hello. Send the link below to Your friend to see his web activity.</p>

    <div>
        <label>Link:
            <input type="text" value="<?php echo grabCurrentURL() . '?id=' . $playgroundId; ?>"/>
        </label>
    </div>

    <div id="wrapper">
        <iframe id="playing-frame"></iframe>
        <div id="panzoom-layer"></div>
    </div>

    <div id="pointer"></div>