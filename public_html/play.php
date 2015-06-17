<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-29
 * Time: 10:53
 */

?>

    <div id="stage1">
        <h1>Your pals claim they only read important things? Let's see the truth!</h1>

        <p>TheNetSpy.com lets You make some fun of Your friends, by showing You what exactly
        they are doing on a specially prepared wacky news website. You will see if Your friend
        chooeses</p>

        <a id="start" href="#">Start</a>

        <div id="preview-wrapper">
            <iframe id="preview-frame"></iframe>
            <div id="preview-panzoom-layer"></div>
        </div>

    </div>

    <div id="stage2">
        <iframe id="preparation-frame" src="wp"></iframe>
        <a id="generate" href="#">Generate</a>

        <div id="dialog1" title="Choose a starting page">
            <p>Behind this dialog You can see a celebrity site that
                You will use to watch Your friend's activity.</p>
            <p>Your pal might
                be a bit surprised though, if You just sent him
                a link to the homepage of a gossip site, right? So, we suggest that You choose some interesting article as a starting point.</p>
            <p><b>Choose a starting page for Your friend, then click "Generate".</b></p>
        </div>
    </div>

    <div id="stage3">
        Generating...
    </div>

    <div id="stage4">
        Copy this link and send it to Your friend (CTRL+C on desktop, touch & hold on mobile):

        <div id="copybox1">
            <label>Link:
                <input type="text" />
            </label>
        </div>

        You can also use the buttons below:

        <a href="whatsapp://send" data-text="Take a look:" data-href="" class="wa_btn wa_btn_l" style="display:none">Send using WhatsApp</a>

        You can use the link multiple times, but watch only one person at a time.
    </div>

    <div id="stage5">
        <div id="counter">N/A</div>
    </div>

    <div id="stage6">
        <div id="menu">
            <a class="again" href=".">Generate another link</a>
            <span id="zoominfo">You can pan and zoom using mouse or your fingers</span>
        </div>
        <div id="wrapper">
            <iframe id="playing-frame"></iframe>
            <div id="panzoom-layer"></div>
        </div>
        <div id="message-box"> <!-- can be generalized if needed -->
            A second person clicked Your link, while the first one is still
            recorded. Two people can't be recorded at the same time.
            The second person was redirected to the main page of TheNetSpy.com.
        </div>
    </div>

    <div id="stage7">
        The user has left the site. As we told You before, he was notified about Your joke.
        We hope You'll survive until tomorrow :).

        You can now send the link to another person:

        <div id="copybox2">
            <label>Link:
                <input type="text" />
            </label>
        </div>

        ... or generate a new link by <a class="again" href=".">clicking here</a>.
    </div>