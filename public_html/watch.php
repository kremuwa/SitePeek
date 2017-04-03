<?php

include('functions.php');

// initial checks
goHomeIfNotLoggedIn();
if (!isset($_GET['site'])) {
    redirect('panel.php');
}
$getSiteDomain = $dbh->prepare("SELECT domain FROM sites WHERE id = ? AND user_id = ?");
$getSiteDomain->execute([$_GET['site'], getLoggedInUserId()]);
$siteDomainRow = $getSiteDomain->fetch();
if ($siteDomainRow === false) { // if the site doesn't belong to user
    redirect('panel.php');
}
$siteDomain = $siteDomainRow['domain'];

?>

<?php include('header.php'); ?>

<script>
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '389335024755312',
            xfbml      : true,
            version    : 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>

<div id="s1-preparation">
    <iframe id="preparation-frame" src="<?php _pr($siteDomain); ?>"></iframe>
    <div id="generateWrapper">
        <div style="font-size: 0.8em">Navigate to the page from which <br/>you want to start watching.</div>
        <div style="font-size: 1em"><strong>THEN</strong> click:</div>
        <a id="generate" href="#">
            Generate
        </a>
    </div>
</div>

<div id="s2-loading">
    <div id="generating">Generating Your link...</div>
</div>

<div id="s3-waiting">

    <div id="linkbox">

        <p>
            Copy Your generated link and think of the best
            way of sending it to Your friend (so that they don't
            get suspicious!)<br/>
        </p>

        <p>
            To copy, press CTRL+C or touch & hold:
        </p>

        <div id="copybox1">
            <label>
                <input type="text"/>
            </label>
        </div>

        <p>
            You can also use the buttons below:
        </p>

        <a href="#" class="whatsapp-send-btn" style="display:none">Send using WhatsApp</a>
        <a href="#" class="fb-send-btn">Send using Messenger</a>

        <p>
            <img class="loading" src="img/loading.gif"/>
            <strong>Waiting for Your friend to click the link...</strong>
        </p>

    </div>

</div>

<div id="s4-playing">
    <div id="menu">
        <a class="again" href=".">Generate another link</a>
        <span id="zoominfo">Drag & move to pan, zoom using mouse scroll</span>
        <div id="zoominfo-mobile">
            Zoom: <input type="range" id="zoom-range" title="A control to zoom the site preview in or out">
        </div>
    </div>
    <div id="wrapper">
        <iframe id="playing-frame"></iframe>
        <div id="panzoom-layer"></div>
    </div>
    <div id="message-box"> <!-- can be generalized if needed -->
        A second person clicked Your link, while the first one is still
        recorded. Two people can't be recorded at the same time.
        The second person was redirected to the main page of SitePeek.tk.
    </div>
</div>

<div id="s5-subjectLeft">

    <div id="s5content">

        <p>
            The user has left the site. As we told You before, they were notified about Your joke.
            We hope You'll survive until tomorrow :)
        </p>

        <p>
            You can now send the link to another person:
        </p>

        <div id="copybox2">
            <label>
                <input type="text"/>
            </label>
        </div>

        <a href="#" class="whatsapp-send-btn" style="display:none">Send using WhatsApp</a>
        <a href="#" class="fb-send-btn">Send using Messenger</a>

        <p>
            ... or generate a new link by <a class="again" href=".">clicking here</a>
        </p>

        <p>
            <img class="loading" src="img/loading.gif"/>
            <strong>Waiting for Your friend to click the link...</strong>
        </p>

    </div>

</div>

<?php include('postbody-scripts.php'); ?>

<script>

    var siteStartAddress = '<?php _pr($siteDomain); ?>';

</script>

<script src="js/vendor/jquery.panzoom.js"></script>
<script src="js/Player.js"></script>
<script>
    $(document).ready(function() {
        Player.init();
    });
</script>
<!--suppress CommaExpressionJS -->
<script type="text/javascript">
    if (typeof wabtn4fg === "undefined") {
        wabtn4fg = 1;
        h = document.head ||
            document.getElementsByTagName("head")[0],
            s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "js/vendor/whatsapp-button.js";
        h.appendChild(s);
    }
</script>
<?php include('footer.php'); ?>
