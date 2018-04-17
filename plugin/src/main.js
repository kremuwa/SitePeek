(function () {
    var inIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    };

    /**
     * Notifies the parent frame about the URL of current page window.postMessage API
     */
    var notifyParentYoureLoaded = function () {
        var message = {
            type: 'sitepeekLibLoaded',
            currentUrl: window.location.href
        };
        sitePeek.utils.sendMessageToOrigin(window.parent, message, sitePeek.config.appDomain);
    };

    var init = function () {
        if (!inIframe()) { // if the site is not even iframed, it's definitely not being tested with SitePeek right now
            return;
        }
        notifyParentYoureLoaded();
        sitePeek.recorder.init();
        sitePeek.player.init();
    };

    // ENTRY POINT
    init();
})();