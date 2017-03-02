// recording variables

var enableMousemoveLogging = true;
var enableScrollLogging = true;
var enableResizeLogging = true;
var frames = [];
var fps = 50; // more is nonsense
var userIsLeaving = false;

// recording and playing variables

var playgroundId = null;
var sitepeekAppDomain = 'http://sitepeek.dev';

// playing variables

var lastTimestamp = 0; // using this variable we will ask PHP for more data after last timestamp
var playDelay = 1000;  // by how many miliseconds the playback will be delayed compared to the recording
var scrollTop = 0;
var currentMouseX = 0;
var currentMouseY = 0;
var noLoadEventsInPlaygroundYet = true;
var userAppeared = false;
var pointerDown = false;
var link = null;

function getCurrentTimestamp() {
    if (!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        }
    }
    return Date.now(); // the result is in ms
}

function mobilecheck() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function sendMessageToOrigin(targetWindow, message, targetOrigin) {
    var messageJSON = JSON.stringify(message);
    targetWindow.postMessage(messageJSON, targetOrigin);
}

function getCaretPosition(el) {
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
}

/**
 * Returns a precise CSS path for a given DOM element. Later the path can be used with jQuery to select only this one element.
 */
function cssPath(el) {
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
}

function addMousemoveFrame(event) {
    if (enableMousemoveLogging) {
        // add new frame
        frames[frames.length] = {
            type: 'mousemove',
            timestamp: getCurrentTimestamp(),
            mouseX: event.pageX,
            mouseY: event.pageY
        };
        enableMousemoveLogging = false;
    }
}

function addClickFrame(event) {
    frames[frames.length] = {
        type: 'click',
        timestamp: getCurrentTimestamp(),
        mouseX: event.pageX,
        mouseY: event.pageY,
        target: cssPath(event.target)
    };
}

function addFocusinFrame(event) {
    frames[frames.length] = {
        type: 'focusin',
        timestamp: getCurrentTimestamp(),
        target: cssPath(event.target)
    };
}

function addFocusoutFrame(event) {
    frames[frames.length] = {
        type: 'focusout',
        timestamp: getCurrentTimestamp(),
        target: cssPath(event.target)
    };
}

function addTextFrame(event) {
    frames[frames.length] = {
        type: 'text',
        timestamp: getCurrentTimestamp(),
        target: cssPath(event.target),
        text: $(event.target).val(),
        caret: getCaretPosition(event.target)
    };
    // to let this function be set as a callback again
    $(event.target).removeProp('toBeFramed');
}

function addScrollFrame(scrollTop) {
    if (enableScrollLogging) {
        // add new frame
        frames[frames.length] = {
            type: 'scroll',
            timestamp: getCurrentTimestamp(),
            scrollTop: scrollTop
        };
        enableScrollLogging = false;
    }
}

function addResizeFrame(width, height) {
    // the if is to limit the frequency of frames generation
    if (enableResizeLogging) {
        // add new frame
        frames[frames.length] = {
            type: 'resize',
            timestamp: getCurrentTimestamp(),
            width: width,
            height: height
        };
        enableResizeLogging = false;
    }
}

function addLoadFrame(width, height, href) {
    // add new frame
    frames[frames.length] = {
        type: 'load',
        timestamp: getCurrentTimestamp(),
        width: width,
        height: height,
        href: href
    };
}

function addUnloadFrame() {
    frames[frames.length] = {
        type: 'unload',
        timestamp: getCurrentTimestamp()
    };
}

function putBatchedData(async) {
    if (playgroundId == null) {
        return;
    }
    async = (typeof async !== 'undefined' ? async : true); // true by default
    $.ajax({
        url: sitepeekAppDomain + "/ajax/putFrames.php",
        data: {
            frames: JSON.stringify(frames),
            playgroundId: playgroundId
        },
        async: async,
        type: "POST",
        success: function() {
            if (!userIsLeaving) {
                putBatchedData();
            }
        },
        // DEBUG
        error: function (xhr, status, errorThrown) {
            console.log("Sorry, there was a problem!");
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        }
    });
    // clear the frames buffer
    frames.length = 0;
}

function unlockPlayground() {
    if (playgroundId == null) {
        return;
    }
    $.ajax({
        url: sitepeekAppDomain + "/ajax/unlockPlayground.php",
        data: {
            playgroundId: playgroundId
        },
        async: false, // becuase performing this call in beforeunload handler
        type: "POST",
        // DEBUG
        error: function (xhr, status, errorThrown) {
            console.log("Sorry, there was a problem!");
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        }
    });
}

function notifyWatcherIfDidnt() {
    // perform only the first time the user is seeing unload communicate
    if (!userIsLeaving) {
        userIsLeaving = true;
        addUnloadFrame();
        putBatchedData(false); // send data (in a synchronous way!) for the last time
        unlockPlayground();
        // TODO remove if all the functions above work without the lines below
        var confirmationMessage = "Are you sure you want to leave?";
        (event || window.event).returnValue = confirmationMessage;     // Gecko and Trident
        return confirmationMessage;
    }
}

function startPutting() {
    putBatchedData();
    // not sure why not use jQuery here, but I was told by internet not to
    window.addEventListener('beforeunload', notifyWatcherIfDidnt);
}

// CATCHING DOM EVENTS

$(window).on('load', function () {
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
        addScrollFrame($(window).scrollTop());
    });
    // to only add new scrolling frames once in a while
    setInterval(function () {
        enableScrollLogging = true;
    }, 1000 / fps);
    // catching resize events
    $(window).on('resize', function () {
        addResizeFrame($(window).width(), $(window).height());
    });
    // to only add new resize frames once in a while
    setInterval(function () {
        enableResizeLogging = true;
    }, 1000 / fps);
    // catching load events (we are in load callback!)
    // we add window size data, too, mainly for first load event
    addLoadFrame($(window).width(), $(window).height(), location.href);
});

/* ============= PLAYING ============= */

function setCaretPosition(el, caretPos) {
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
}

function startPlaying() {
    getNewFramesAndScheduleTheirActions();
}

function getNewFramesAndScheduleTheirActions() {
    $.ajax({
        url: sitepeekAppDomain + "/ajax/getFrames.php",
        data: {
            lastTimestamp: lastTimestamp,
            playgroundId: playgroundId
        },
        dataType: "text",
        type: "POST",
        success: function (json) {
            var frames = JSON.parse(json);
            // if some frames were delivered...
            if (frames.length > 0) {
                // save the timestamp of most recent frame received from the server
                lastTimestamp = frames[frames.length - 1].timestamp;
                scheduleFrameActions(frames);
                frames.length = 0;
            }
            getNewFramesAndScheduleTheirActions();
        }
    });
}

function scheduleFrameActions(frames) {
    $.each(frames, function (index, frame) {
        // parseInt because in PHP the value from database was sent as a string
        var timeout = playDelay - (getCurrentTimestamp() - parseInt(frame.timestamp));
        setTimeout(function () {
            executeFrameActions(frame)
        }, (timeout > 0 ? timeout : 0));
        // load event means user presence, so detect it and count down
        if (!userAppeared && (frame.type == 'load')) {
            userAppeared = true;
            var message = {
                type: 'beginCountdown',
                timeout: timeout
            };
            sendMessageToOrigin(window.parent, message, sitepeekAppDomain);
        }
        if (frame.type == 'unload') {
            // allow new user to come
            userAppeared = false;
        }
    });
}

function executeFrameActions(frame) {
    var pointer = $('#pointer');
    var wrapper = $('#wrapper');
    if (frame.type == 'mousemove') {
        // move the image of mouse; we use parseFloat because some properties are text (from DB)
        currentMouseX = frame.mouseX;
        currentMouseY = frame.mouseY;
        pointer.offset({
            left: parseFloat(currentMouseX),
            top: parseFloat(currentMouseY)
        });
        // if we're not panning at the moment...
        if (!pointerDown) {
            // notify the parent frame to center the view on cursor
            var message = {
                type: 'centerViewOnCursor',
                currentMouseX: currentMouseX,
                currentMouseY: currentMouseY
            };
            sendMessageToOrigin(window.parent, message, sitepeekAppDomain);
        }
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
                left: parseFloat(currentMouseX) - 15,
                top: parseFloat(currentMouseY) - 15
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
        scrollTop = frame.scrollTop;
        $('body').scrollTop(scrollTop);
    }
    else if (frame.type == 'resize') {
        var messageWindowResized = {
            type: 'windowResized',
            width: frame.width,
            height: frame.height
        };
        sendMessageToOrigin(window.parent, messageWindowResized, sitepeekAppDomain);
    }
    else if (frame.type == 'load') {
        window.location.href = frame.href;
        // newly loaded website has to be resized too, in order to
        // fit in viewer's browser width.
        // needed only for first page load
        scrollTop = 0;
        if (noLoadEventsInPlaygroundYet) {
            // smart way to reuse my code :)
            executeFrameActions({
                type: 'resize',
                width: frame.width,
                height: frame.height
            });
            noLoadEventsInPlaygroundYet = false;
        }
    }
    else if (frame.type == 'unload') {
        // if a new user appeared between scheduling and execution of this frame, we won't execute at all
        if (userAppeared)
            return false;
        // otherwise, show the information that the user is gone
        $('#stage6').fadeOut(400, function () {
            $('#stage7').fadeIn(400, function () {
                // select field content only if we're not on mobile - TODO but why?
                if (!mobilecheck()) {
                    $('#copybox2').find('input')
                        .trigger('focus')
                        .select();
                }
            });
        });
    }
    else if (frame.type == 'secondvisitor') {
        // show the information that a second user came
        // while the first one was being recorded
        $('#message-box').fadeIn(400, function () {
            setTimeout(function () {
                $('#message-box').fadeOut(400);
            }, 8000)
        });
    }
}

//// end of functions

$(document).on('ready', function () {
    // notify the playground maker about current URL, so it knows what to save as a start page when user clicks "generate"
    var message = {
        type: 'currentUrl',
        currentUrl: window.location.href
    };
    sendMessageToOrigin(window.parent, message, sitepeekAppDomain);
    // custom easing effect for hiding clicktraces
    $.extend($.easing,
        {
            easeOutQuint: function (x, t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            }
        });
});

$(window).on("message", function (event) {
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== sitepeekAppDomain) // if the message is not coming from a trusted source
        return;
    var data = event.data || event.originalEvent.data;
    var receivedMessage = JSON.parse(data);
    // checking for message type
    if (receivedMessage.type == 'startPutting') {
        playgroundId = receivedMessage.playgroundId;
        startPutting();
    } else if (receivedMessage.type == 'startPlaying') {
        playgroundId = receivedMessage.playgroundId;
        startPlaying();
    }
});