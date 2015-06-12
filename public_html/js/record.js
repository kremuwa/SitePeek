// global variables

var enableMousemoveLogging = true;
var enableScrollLogging = true;
var enableResizeLogging = true;
var frames = [];
var fps = 50; // more is nonsense
var firstTime = true;
var allowUnload = false;
var notified = false;
var sendBatchedDataInterval = null;

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

    // the if is to limit the frequency of frames generation

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

function addUnloadFrame(event) {

    frames[frames.length] = {
        type: 'unload',
        timestamp: event.timeStamp
    };

}

/* performed every 5 seconds; sends data from an array to the server */

function sendBatchedData(async) {

    // async is true by default

    async = (typeof async !== 'undefined' ? async : true);

    $.ajax({

        url: "ajax/putFrames.php",
        data: {
            frames: JSON.stringify(frames),
            playgroundId: playgroundId
        },
        async: async,

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

function unlockPlayground() {

    $.ajax({

        url: "ajax/unlockPlayground.php",
        data: {
            playgroundId: playgroundId
        },

        // becuase performing this call in beforeunload handler
        async: false,

        type: "POST",

        // DEBUG
        error: function( xhr, status, errorThrown ) {
            console.log( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });

}

$('#recording-frame').load(function(event) {

    if(firstTime)
    {
        firstTime = false;

        // send data every couple of seconds

        sendBatchedDataInterval = setInterval(sendBatchedData, 2000);
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

        var recordingFrame = $('#recording-frame');

        addResizeFrame(event, recordingFrame.width(), recordingFrame.height());
    });

    // to only add new data once in a while

    setInterval(function() {
        enableResizeLogging = true;
    }, 1000 / fps);

    // catching load events (we are in load callback!)
    // we add iframe size data, too, mainly for first load event

    var recordingFrame = $('#recording-frame');

    addLoadFrame(event, recordingFrame.width(), recordingFrame.height(), this.contentWindow.location.href);

});

// not sure why not use jQuery here, but I was told by internet not to

window.addEventListener('beforeunload', function(event) {

    // this boolean is set when the link to create Your own game is clicked

    if(allowUnload)
        return null;

    // perform only the first time the user is seeing unload communicate

    if(!notified) {

        // stop sending data periodically, send it (in a synchronous way!) for the last time

        clearInterval(sendBatchedDataInterval);

        addUnloadFrame(event);

        sendBatchedData(false);

        unlockPlayground();

        notified = true;
    }

    $('#recording-frame').hide();
    $('#notification').show();

    var confirmationMessage = "Surprise :D! Your friend played a joke on You! He sent You a " +
        "very special link, and saw everything You were doing since You clicked on it. " +
        "If You would also like to make fun of spying on somebody, go to TheNetSpy.com or just stay " +
        "on this page and click the link below :)";

    (event || window.event).returnValue = confirmationMessage;     // Gecko and Trident
    return confirmationMessage;

});

$('#createYourOwn').on('click', function(){

    allowUnload = true;

});