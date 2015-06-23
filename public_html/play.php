<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-29
 * Time: 10:53
 */

?>

    <div id="stage1">

       <div class="info">

            <h1>
                Watch Your pals with a hidden camera
            </h1>

            <p>
                TheNetSpy.com lets You make some fun of Your friends, by showing You what exactly
                they are doing on a wacky news website - without them knowing!
            </p>

            <p>
                You can get the idea by looking on the background ;-)
            </p>

            <p>
                You will see which article they choose, what they focus on, which comment they agree with and
                what they have to say.
            </p>

            <a id="start" href="#">Let's go!</a>

        </div>

        <div id="preview-wrapper">
            <iframe id="preview-frame"></iframe>
            <div id="preview-panzoom-layer"></div>
        </div>

    </div>

    <div id="stage2">
        <iframe id="preparation-frame" src="wp"></iframe>
        <div id="generateWrapper">
            <div style="font-size: 0.8em">Choose a starting page.</div>
            <div style="font-size: 1em"><strong>THEN</strong> click:</div>
            <a id="generate" href="#">
                Generate
            </a>
        </div>
        <div id="dialog1" title="Choose a starting page">
            <p>Behind this dialog You can see a wacky news site that
                You will use to watch Your friend's activity.</p>
            <p>Your pal might
                be a bit surprised though, if You just sent them
                a link to the homepage of a funny site, right? So, we suggest that You choose some interesting article as a starting point.</p>
            <p><b>Choose a starting page for Your friend, then click "Generate".</b></p>
        </div>
    </div>

    <div id="stage3">
        <div id="generating">Generating Your link...</div>
    </div>

    <div id="stage4">

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
                    <input type="text" />
                </label>
            </div>

            <p>
                You can also use the buttons below:
            </p>

            <a href="#" class="whatsapp-send-btn" style="display:none">Send using WhatsApp</a>
			<a href="#" class="fb-send-btn" style="display:none">Send using Messenger</a>
            <a href="#" class="fb-share-btn">Share on Facebook</a>

            <p>
                <img class="loading" src="img/loading.gif" />
                <strong>Waiting for Your friend to click the link...</strong>
            </p>

            <div id="dialog2" title="Heads up!">
                <p>
                    Our site is meant just for fun, not for spying. When You
                    finish watching, Your friend will be notified about the joke!
                    So do it only if You know they won't be too mad at You! ;)
                </p>
            </div>

        </div>

    </div>

    <div id="stage5">
        <div id="counter">N/A</div>
    </div>

    <div id="stage6">
        <div id="menu">
            <a class="again" href=".">Generate another link</a>
            <span id="zoominfo">Pan and zoom using mouse or your fingers</span>
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

        <div id="stage7content">

            <p>
                The user has left the site. As we told You before, they were notified about Your joke.
                We hope You'll survive until tomorrow :)
            </p>

            <p>
                You can now send the link to another person:
            </p>

            <div id="copybox2">
                <label>
                    <input type="text" />
                </label>
            </div>

            <a href="whatsapp://send" data-text="Take a look:" data-href="" class="wa_btn wa_btn_l" style="display:none">Send using WhatsApp</a>
            <a href="#" class="fb-send-btn" style="display:none">Send with Messenger</a>
            <a href="#" class="fb-share-btn">Share on Facebook</a>

            <p>
                ... or generate a new link by <a class="again" href=".">clicking here</a>
            </p>

            <p>
                <img class="loading" src="img/loading.gif" />
                <strong>Waiting for Your friend to click the link...</strong>
            </p>

        </div>

    </div>