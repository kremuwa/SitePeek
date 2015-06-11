<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-29
 * Time: 10:53
 */

?>



    <div id="stage1">
        Hello. Here You will make Your peeking machine.

        <a id="start" href="#">Start</a>
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

        <div id="copybox">
            <label>Link:
                <input type="text" />
            </label>
        </div>

        You can use the link multiple times, but watch only one person at a time.
    </div>

    <div id="stage5">
        <div id="counter">N/A</div>
    </div>

    <div id="stage6">
        <div id="menu">
            <a id="again" href=".">Generate another link</a>
            <span id="zoominfo">You can pan and zoom using mouse or your fingers</span>
        </div>
        <div id="wrapper">
            <iframe id="playing-frame"></iframe>
            <div id="panzoom-layer"></div>
        </div>
    </div>