<?php

// TODO zooming - fix transform origin problem while zooming (maybe 0,0 focal point?) and lock when zooming out excessively
// TODO view centering
// TODO Your own comments are visible when You are peeking

?>

<!doctype html>
<html class="no-js <?php echo (isset($_GET['id']) ? 'record' : 'play'); ?>" lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <!-- Place favicon.ico in the root directory -->

    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/vendor/modernizr-2.8.3.min.js"></script>

</head>
<body>
<!--[if lt IE 8]>
<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
<![endif]-->

    <?php
    // if we are recording
    if(isset($_GET['id'])) {

        include('record.php');

    }
    else {

        include('play.php');

    }
    ?>


    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.11.2.min.js"><\/script>')</script>
    <script src="js/plugins.js"></script>

    <?php
        // if we are recording
        if(isset($_GET['id'])):
    ?>

    <script src="js/record.js"></script>

    <?php
        // if we are playing
        else:
    ?>

    <script src="js/play.js"></script>
    <script src="js/vendor/jquery.panzoom.min.js"></script>

    <?php endif; ?>

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
