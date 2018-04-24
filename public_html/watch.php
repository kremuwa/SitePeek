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
    window.fbAsyncInit = function () {
        FB.init({
            appId: '389335024755312',
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>

<div id="s1-preparation">
    <iframe id="preparation-frame" src="<?php _pr($siteDomain); ?>"></iframe>
    <div class="btn-sitepeek btn-sitepeek-small button-go-back">
        &larr; list of sites
    </div>
    <div id="add-testspace-wrapper">
        <div style="font-size: 0.8em">
            Navigate to the page from which<br/>
            the subject will start the test.
        </div>
        <div style="font-size: 1em"><strong>THEN</strong> click:</div>
        <a id="add-testspace-btn" class="btn-sitepeek btn-sitepeek-big" href="#">
            Add testspace
        </a>
    </div>
</div>

<div id="s2-loading" class="text-board">
    <div class="content-centerer-xy">Adding a new testspace...</div>
</div>

<div id="s3-waiting" class="text-board">
    <div class="btn-sitepeek btn-sitepeek-small button-go-back">
        &larr;
    </div>
    <div class="content-centerer-xy">
        <p>
            Copy Your generated link and send it to the test subject.
        </p>
        <p>
            To copy, press CTRL+C or touch & hold:
        </p>
        <div id="copybox1">
            <input type="text" title="Textfield with a link to added testspace."/>
        </div>
        <p>
            You can also use the buttons below:
        </p>
        <a href="#" class="whatsapp-send-btn hidden">Send using WhatsApp</a>
        <a href="#" class="fb-send-btn">Send using Messenger</a>
        <p>
            <img class="loading" src="img/loading.gif"/>
            <strong>Waiting for the test subject to enter the testspace...</strong>
        </p>
    </div>
</div>

<div id="s4-playing">
    <div id="menu">
        <a class="again btn-sitepeek btn-sitepeek-small" href=".">Create another testspace</a>
        <span id="zoominfo">Drag & move to pan, zoom using mouse scroll</span>
        <div id="zoominfo-mobile">
            Zoom: <input type="range" id="zoom-range" title="A control to zoom the site preview in or out">
        </div>
    </div>
    <div id="wrapper">
        <iframe id="playing-frame"></iframe>
        <!-- user's dragging and scrolling events on the #panzoom-layer will pan and zoom the #playing-frame as well.
        I had to use additional element for that, because I disabled all pointer events on #playing-frame, since
        I don't want the user to be able to interfere with events simulated inside of the #playing-frame by affecting
        its content directly (clicking links, scrolling, etc.) -->
        <div id="panzoom-layer"></div>
    </div>
    <div id="second-visitor-msg-box"> <!-- can be generalized if needed -->
        A second person clicked Your link, while the first one is still recorded. Two people can't be recorded at the
        same time. The second person was redirected to the main page of SitePeek.tk.
    </div>
</div>

<div id="s5-subject-left" class="text-board">
    <div class="btn-sitepeek btn-sitepeek-small button-go-back">
        &larr;
    </div>
    <div class="content-centerer-xy">
        <p>
            The test subject has left the site. We hope you've learned some usability insights from them!
        </p>
        <p>
            You can now send the link to another test subject:
        </p>
        <div id="copybox2">
            <input type="text" title="Textfield with a link to added testspace."/>
        </div>
        <a href="#" class="whatsapp-send-btn hidden">Send using WhatsApp</a>
        <a href="#" class="fb-send-btn">Send using Messenger</a>
        <p>
            ... or generate a new link by <a class="again btn-sitepeek btn-sitepeek-small" href=".">clicking here</a>
        </p>
        <p>
            <img class="loading" src="img/loading.gif"/>
            <strong>Waiting for the test subject to enter the testspace...</strong>
        </p>
    </div>
</div>

<?php include('postbody-scripts.php'); ?>

<script>

    var siteStartAddress = '<?php _pr($siteDomain); ?>';

</script>

<script src="js/vendor/jquery.panzoom.js"></script>
<script src="js/player.js"></script>
<script>
    player.init();
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
