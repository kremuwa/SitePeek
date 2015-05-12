<!doctype html>
<html class="no-js" lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Right now I'm changing the title of the document.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <!-- Place favicon.ico in the root directory -->

    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/main.css">
    <script src="js/vendor/modernizr-2.8.3.min.js"></script>
</head>
<body>
<!--[if lt IE 8]>
<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
<![endif]-->

    <?php if(isset($_POST['submit'])): ?>

        <?php

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

    <p>Playground added</p>

    <p>The sites are available here:</p>

        <a href="record.php?id=<?php echo $_POST['playgroundID']; ?>">Record</a>
        <a href="play.php?id=<?php echo $_POST['playgroundID']; ?>">Play</a>

    <?php else: ?>

    <form id="form" action="." method="POST">
        <h1>Enter a URL:</h1>
        <label for="url">URL:</label><input type="text" name="url" id="url" />
        <input type="hidden" value="<?php echo uniqid(); ?>" name="playgroundID" />
        <input type="submit" value="Submit" name="submit" />
    </form>

    <div id="loading-img">Checking if the website You gave us is compatible...</div>
    <div id="xfo-check-fail">Please try another site, as this one is not compatible. You can also pick one from the list</div>

    <?php endif; ?>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.11.2.min.js"><\/script>')</script>
<script src="js/plugins.js"></script>
<script src="js/index.js"></script>

<!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
<!--suppress JSUnresolvedFunction -->
<script>
    (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
        e=o.createElement(i);r=o.getElementsByTagName(i)[0];
        e.src='https://www.google-analytics.com/analytics.js';
        r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
    ga('create','UA-XXXXX-X','auto');ga('send','pageview');
</script>
</body>
</html>
