var sitePeek = {
    config: {
        appDomain: 'http://sitepeek.tk'
    }
};
sitePeek.player = (function () {
    var currentMouseX = 0;
    var currentMouseY = 0;

    var init = function () {
        // custom easing effect for hiding clicktraces
        $.extend($.easing, {
            easeOutQuint: function (x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            }
        });
        $(window).on("message", handleMessages);
        // some CSS to style the cursor
        document.write(
            "<style type='text/css'>" +
            "#sitepeek-cursor {\n" +
            "    background: transparent url('" + sitePeek.config.appDomain + "/img/cursor.png') no-repeat;\n" +
            "    position: absolute;\n" +
            "    width: 12px;\n" +
            "    height: 20px;\n" +
            "    z-index: 10000;\n" +
            "}" +
            "</style>"
        );
    };

    var handleMessages = function () {
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== sitePeek.config.appDomain) // if the message is not coming from a trusted source
            return;
        var data = event.data || event.originalEvent.data;
        var receivedMessage = JSON.parse(data);
        // checking for message type
        if (receivedMessage.type == 'executeFrameAction') {
            executeFrameAction(receivedMessage.frame);
        }
    };

    var setCaretPosition = function (el, caretPos) {
        //noinspection SillyAssignmentJS
        el.value = el.value;
        // ^ this is used to not only get "focus", but
        // to make sure we don't have it everything -selected-
        // (it is an issue in chrome, and having the above doesn't hurt any other browser)
        if (el !== null) {
            if (el.createTextRange) {
                var range = el.createTextRange();
                range.move('character', caretPos);
                range.select();
                return true;
            }
            else {
                // (el.selectionStart === 0 added for Firefox bug)
                if (el.selectionStart || el.selectionStart === 0) {
                    el.focus();
                    el.setSelectionRange(caretPos, caretPos);
                    return true;
                }
                else { // fail city, fortunately this never happens (as far as I've tested) :)
                    el.focus();
                    return false;
                }
            }
        }
    };

    var executeFrameAction = function (frame) {
        var wrapper = $('#wrapper');
        if (frame.type == 'mousemove') {
            //noinspection JSJQueryEfficiency
            if ($('#sitepeek-cursor').length == 0) {
                $('body').append('<div id="sitepeek-cursor"></div>');
            }
            // move the image of mouse; we use parseFloat because some properties are text (from DB)
            currentMouseX = parseFloat(frame.mouseX);
            currentMouseY = parseFloat(frame.mouseY);
            //noinspection JSJQueryEfficiency
            $('#sitepeek-cursor').offset({
                left: currentMouseX,
                top: currentMouseY
            });
        }
        else if (frame.type == 'click') {
            $('<div class="clicktrace"></div>')
                .css({
                    'background': 'cyan',
                    'border-radius': '15px',
                    'height': '30px',
                    'width': '30px',
                    'position': 'absolute',
                    'z-index': '10000'
                })
                .offset({
                    // -15 because we want the click circle to be centered
                    left: currentMouseX - 15,
                    top: currentMouseY - 15
                })
                .appendTo($('body'))
                .fadeOut(2000, 'easeOutQuint', function () {
                    $(this).remove();
                });
            // run all handlers associated with DOM click event on the target element
            $(frame.target).trigger('click');
        }
        else if (frame.type == 'focusin') {
            // run all handlers associated with DOM focus event on the target element
            $(frame.target).trigger('focus');
        }
        else if (frame.type == 'focusout') {
            // run all handlers associated with DOM blur event on the target element
            $(frame.target).trigger('blur');
        }
        else if (frame.type == 'text') {
            var target = $(frame.target);
            target.val(frame.text);
            setCaretPosition(target[0], frame.caret);
        }
        else if (frame.type == 'scroll') {
            $('body').scrollTop(frame.scrollTop).scrollLeft(frame.scrollLeft);
        }
    };

    return {
        init: init
    }
})();

sitePeek.recorder = (function () {
    var enableMousemoveLogging = true;
    var enableScrollLogging = true;
    var fps = 50; // more is nonsense

    var init = function () {
        $(window).on("message", handleMessages);
    };
    
    var handleMessages = function () {
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== sitePeek.config.appDomain) // if the message is not coming from a trusted source
            return;
        var data = event.data || event.originalEvent.data;
        var receivedMessage = JSON.parse(data);
        // checking for message type
        if (receivedMessage.type == 'testspaceReady') {
            setupEventCatching();
            addLoadFrame(location.href);
        }
    };

    var setupEventCatching = function () {
        var $body = $('body');
        // catching mousemove events
        $body.on('mousemove', function (event) {
            addMousemoveFrame(event);
        });
        // to only add new data once in a while
        setInterval(function () {
            enableMousemoveLogging = true;
        }, 1000 / fps);
        // catching click events
        $body.on('click', function (event) {
            addClickFrame(event);
        });
        // catching focusin events
        $(document).on('focusin', function (event) {
            addFocusinFrame(event);
        });
        // catching focusout events
        $(document).on('focusout', function (event) {
            addFocusoutFrame(event);
        });
        // catching text events (propertychange is for IE <9)
        $(document).on('input propertychange', function (event) {
            // if no active timeout is set for this element yet...
            if ($(event.target).prop('toBeFramed') == undefined) {
                $(event.target).prop('toBeFramed', true);
                //... let's set one
                setTimeout(function () {
                    addTextFrame(event)
                }, 1000);
            }
        });
        // catching scroll events
        $(window).on('scroll', function () {
            addScrollFrame($(window).scrollTop(), ($(window).scrollLeft()));
        });
        // to only add new scrolling frames once in a while
        setInterval(function () {
            enableScrollLogging = true;
        }, 1000 / fps);
    };

    var getCurrentTimestamp = function () {
        if (!Date.now) {
            Date.now = function () {
                return new Date().getTime();
            }
        }
        return Date.now(); // the result is in ms
    };

    var getCaretPosition = function (el) {
        var start = 0, normalizedValue, range, textInputRange, len, endRange;
        try {
            if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                start = el.selectionStart;
            } else {
                range = document.selection.createRange();
                if (range && range.parentElement() == el) {
                    len = el.value.length;
                    normalizedValue = el.value.replace(/\r\n/g, "\n");
                    // Create a working TextRange that lives only in the input
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());
                    // Check if the start and end of the selection are at the very end
                    // of the input, since moveStart/moveEnd doesn't return what we want
                    // in those cases
                    endRange = el.createTextRange();
                    endRange.collapse(false);
                    if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;
                    }
                }
            }
        } catch (e) {
            // selection invalid for this element, return 0
            start = 0;
        }
        return start;
    };

    /**
     * Returns a precise CSS path for a given DOM element. Later the path can be used with jQuery to select only this one element.
     */
    var getCssPath = function (el) {
        var path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            var selector = el.nodeName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break;
            } else {
                var sib = el, nth = 1;
                while (sib = sib.previousElementSibling) {
                    if (sib.nodeName.toLowerCase() == selector)
                        nth++;
                }
                if (el.previousElementSibling != null || el.nextElementSibling != null)
                    selector += ":nth-of-type(" + nth + ")";
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(" > ");
    };

    var sendFrameToParentWindow = function (frame) {
        var message = {
            type: 'addFrame',
            frame: frame
        };
        sitePeek.utils.sendMessageToOrigin(window.parent, message, sitePeek.config.appDomain);
    };

    var addMousemoveFrame = function (event) {
        if (enableMousemoveLogging) {
            // add new frame
            sendFrameToParentWindow({
                type: 'mousemove',
                timestamp: getCurrentTimestamp(),
                mouseX: event.pageX,
                mouseY: event.pageY
            });
            enableMousemoveLogging = false;
            
        }
    };

    var addClickFrame = function (event) {
        sendFrameToParentWindow({
            type: 'click',
            timestamp: getCurrentTimestamp(),
            mouseX: event.pageX,
            mouseY: event.pageY,
            target: getCssPath(event.target)
        });
    };

    var addFocusinFrame = function (event) {
        sendFrameToParentWindow({
            type: 'focusin',
            timestamp: getCurrentTimestamp(),
            target: getCssPath(event.target)
        });
    };

    var addFocusoutFrame = function (event) {
        sendFrameToParentWindow({
            type: 'focusout',
            timestamp: getCurrentTimestamp(),
            target: getCssPath(event.target)
        });
    };

    var addTextFrame = function (event) {
        sendFrameToParentWindow({
            type: 'text',
            timestamp: getCurrentTimestamp(),
            target: getCssPath(event.target),
            text: $(event.target).val(),
            caret: getCaretPosition(event.target)
        });
        // to let this var be = function set as a callback again
        $(event.target).removeProp('toBeFramed');
    };

    var addScrollFrame = function (scrollTop, scrollLeft) {
        if (enableScrollLogging) {
            // add new frame
            sendFrameToParentWindow({
                type: 'scroll',
                timestamp: getCurrentTimestamp(),
                scrollTop: scrollTop,
                scrollLeft: scrollLeft
            });
            enableScrollLogging = false;
        }
    };

    /**
     * The load frame means that a new URL was open and sitepeek.js was loaded on it
     *
     * @param href the URL that was open
     */
    var addLoadFrame = function (href) {
        // add new frame
        sendFrameToParentWindow({
            type: 'load',
            timestamp: getCurrentTimestamp(),
            href: href
        });
    };

    return {
        init: init
    }
})();

sitePeek.utils = (function () {
    return {
        sendMessageToOrigin: function (targetWindow, message, targetOrigin) {
            var messageJSON = JSON.stringify(message);
            targetWindow.postMessage(messageJSON, targetOrigin);
        }
    }
})();
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