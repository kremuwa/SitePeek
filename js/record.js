// global variables

var enableMousemoveLogging = true;
var enableScrollLogging = true;
var enableResizeLogging = true;
var frames = [];
var fps = 50; // more is nonsense
var firstTime = true;

function getCaretPosition(el) {
    var start = 0, normalizedValue, range,
        textInputRange, len, endRange;
    
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

    } catch(e) {
        // selection invalid for this element, return 0
        start = 0;
    }

    return start;
}

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
                selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
}

function addMousemoveFrame(event) {

    if(enableMousemoveLogging) {

        // add new frame

        frames[frames.length] = {
            type: 'mousemove',
            timestamp: event.timeStamp,
            mouseX: event.pageX,
            mouseY: event.pageY
        };

        enableMousemoveLogging = false;
    }

}

function addClickFrame(event) {

	frames[frames.length] = {
        type: 'click',
		timestamp: event.timeStamp,
		mouseX: event.pageX,
		mouseY: event.pageY,
        target: cssPath(event.target)
	};

}

function addFocusinFrame(event) {

    frames[frames.length] = {
        type: 'focusin',
		timestamp: event.timeStamp,
        target: cssPath(event.target)
	};

}

function addFocusoutFrame(event) {

    frames[frames.length] = {
        type: 'focusout',
        timestamp: event.timeStamp,
        target: cssPath(event.target)
    };

}

function addTextFrame(event) {

    frames[frames.length] = {
        type: 'text',
        timestamp: event.timeStamp,
        target: cssPath(event.target),
        text: $(event.target).val(),
        caret: getCaretPosition(event.target)
    };

    // to let this funciton be set as a callback again

    $(event.target).removeProp('toBeFramed');

}

function addScrollFrame(event, scrollTop) {

    if(enableScrollLogging) {

        // add new frame

        frames[frames.length] = {
            type: 'scroll',
            timestamp: event.timeStamp,
            scrollTop: scrollTop
        };

        enableScrollLogging = false;

    }

}

function addResizeFrame(event, width, height) {

    if(enableResizeLogging){

        // add new frame

        frames[frames.length] = {
            type: 'resize',
            timestamp: event.timeStamp,
            width: width,
            height: height
        };

        enableResizeLogging = false;
    }

}

function addLoadFrame(event, width, height, href) {

        // add new frame

        frames[frames.length] = {
            type: 'load',
            timestamp: event.timeStamp,
            width: width,
            height: height,
            href: href
        };

}

/* performed every 5 seconds; sends data from an array to the server */

function sendBatchedData() {

    $.ajax({

        url: "ajax/putFrames.php",
        data: {
            frames: JSON.stringify(frames),
            playgroundId: playgroundId
        },

        type: "POST",

        // DEBUG
        error: function( xhr, status, errorThrown ) {
            console.log( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });

    // clear the frames buffer (hopefully after stringification)

    frames.length = 0;

}

$('#recordingFrame').load(function(event) {

    if(firstTime)
    {
        firstTime = false;

        // send data every couple of seconds

        setInterval(sendBatchedData, 2000);
    }

    // catching mousemove events

    $(this).contents().find('body').on('mousemove', function(event) {
        addMousemoveFrame(event);
    });

    // to only add new data once in a while

    setInterval(function() {
        enableMousemoveLogging = true;
    }, 1000 / fps);

    // catching click events

    $(this).contents().find('body').on('click', function(event) {
        addClickFrame(event);
    });

    // catching focusin events

    $(this).contents().on('focusin', function(event) {
        addFocusinFrame(event);
    });

    // catching focusout events

    $(this).contents().on('focusout', function(event) {
        addFocusoutFrame(event);
    });

    // catching text events (propertychange is for IE <9)

    $(this).contents().on('input propertychange', function(event) {


        // if no active timeout is set for this element yet...

        if($(event.target).prop('toBeFramed') == undefined) {

            $(event.target).prop('toBeFramed', true);

            //... let's set one

            setTimeout(function() { addTextFrame(event) }, 1000);
        }
    });

    // catching scroll events

    $(this).contents().on('scroll', function(event) {
        addScrollFrame(event, $(this).scrollTop());
    });

    // to only add new data once in a while

    setInterval(function() {
        enableScrollLogging = true;
    }, 1000 / fps);

    // catching resize events

    $(this.contentWindow).on('resize', function(event) {

        var recordingFrame = $('#recordingFrame');

        addResizeFrame(event, recordingFrame.width(), recordingFrame.height());
    });

    // to only add new data once in a while

    setInterval(function() {
        enableResizeLogging = true;
    }, 1000 / fps);

    // catching load events (we are in load callback!)
    // we add iframe size data, too, mainly for first load event

    var recordingFrame = $('#recordingFrame');

    addLoadFrame(event, recordingFrame.width(), recordingFrame.height(), this.contentWindow.location.href);

});