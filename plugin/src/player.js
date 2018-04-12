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
