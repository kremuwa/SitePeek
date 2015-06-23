<?php

// TODO check your media queries with various resolutions (translations are making unable to even scroll when the height is not big enough)
// TODO fix some errors on firefox
// TODO some hoover animation for social buttons, and generally make them WORK
// TODO productionate the project
// TODO clicking on the slider main content doesn't navigate
// TODO privacy policy
// TODO communicate when users try to click on playing/preview frame (local, similarly to clicktrace)
// TODO fix the error with frame translating up after clicking "Reply to comment"
// TODO sometimes when clicking "Let's go" the whole site gets stuck
// TODO Your own comments are visible when You are peeking
// TODO focus events?

?>

<!doctype html>
<html class="no-js <?php echo (isset($_GET['id']) ? 'record' : 'play'); ?>" lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

	<?php
        // if we are recording
        if(isset($_GET['id'])):
    ?>

    <title>celebrities24.tk - hottest news round a clock</title>
    <meta name="description" content="On celebrities24.tk you can find only the
	hottest news about the subjects You care about. Full speed 24h!">

	<meta property="og:title" content="celebrities24.tk - hottest news round a clock" />
	<meta property="og:description" content="On celebrities24.tk you can find only the hottest news about the subjects You care about. Full speed 24h!" />
	<meta property="og:image" content="http://celebrities24.tk/img/fb-share-c24.png" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="celebrities24" />
	<meta property="fb:admins" content="1769520946" />

    <?php
        // if we are playing
        else:
    ?>

    <title>TheNetSpy.com - watch Your pals with a hidden camera</title>
    <meta name="description" content="TheNetSpy.com lets You make some fun of Your friends, by showing You what exactly they are doing on a wacky news website - without them knowing!">

	<meta property="og:title" content="TheNetSpy.com - watch Your pals with a hidden camera" />
	<meta property="og:description" content="TheNetSpy.com lets You make some fun of Your friends, by showing You what exactly they are doing on a wacky news website - without them knowing!" />
	<meta property="og:image" content="http://thenetspy.com/img/fb-share-tns.png" />
	<meta property="og:url" content="http://thenetspy.com/" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="TheNetSpy" />
	<meta property="fb:admins" content="1769520946" />

    <?php endif; ?>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <!-- Place favicon.ico in the root directory -->

    <link rel="stylesheet" href="css/vendor/normalize.css">
    <link rel="stylesheet" href="css/vendor/jquery-ui/jquery-ui.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/vendor/modernizr-2.8.3.min.js"></script>

</head>
<body>

    <!-- facebook SDK -->

    <script>
        window.fbAsyncInit = function() {
            FB.init({
                appId      : '723088037803571',
                xfbml      : true,
                version    : 'v2.3'
            });
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    </script>

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
    <script src="js/vendor/jquery-ui.min.js"></script>
    <script src="js/plugins.js"></script>

    <?php
        // if we are recording and we are not facebook crawler

        if(isset($_GET['id']) && !stristr($_SERVER['HTTP_USER_AGENT'], 'FacebookExternalHit')):
    ?>

    <script src="js/record.js"></script>

    <?php
        // if we are playing
        else:
    ?>

    <script src="js/play.js"></script>
    <script src="js/vendor/jquery.panzoom.min.js"></script>
    <!--suppress CommaExpressionJS -->
    <script type="text/javascript">if(typeof wabtn4fg==="undefined")
        {wabtn4fg=1;
        h=document.head||
        document.getElementsByTagName("head")[0],
            s=document.createElement("script");
        s.type="text/javascript";
        s.src="js/vendor/whatsapp-button.js";
        h.appendChild(s);}
    </script>

    <?php endif; ?>

    <!--suppress JSUnresolvedFunction, CommaExpressionJS -->
    <script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-64298390-1', 'auto');
	  ga('send', 'pageview');

	</script>

	<script type="text/javascript">
	   var _mfq = _mfq || [];
	   (function() {
		   var mf = document.createElement("script"); mf.type = "text/javascript"; mf.async = true;
		   mf.src = "//cdn.mouseflow.com/projects/7731cfb1-4d10-44c3-9d63-c64b0ef30db2.js";
		   document.getElementsByTagName("head")[0].appendChild(mf);
	   })();
	</script>
</body>
</html>
