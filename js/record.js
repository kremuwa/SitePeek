// global variables

var enableMousemoveLogging = false;
var enableScrollLogging = false;
var frames = [];
var fps = 50; // more is nonsense


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
            if (nth != 1)
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

function addLoadFrame(event, href) {

        // add new frame

        frames[frames.length] = {
            type: 'load',
            timestamp: event.timeStamp,
            href: href
        };

}

/* performed every 5 seconds; sends data from an array to the server */

function sendBatchedData() {

    $.ajax({

        url: "ajax/putFrames.php",
        data: {
            frames: JSON.stringify(frames)
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


    // catching mousemove events

    $(this).contents().find('body').on('mousemove', function(event) {
        addMousemoveFrame(event);
    });

    // to only add new data every 100 ms

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

    // catching key events

    // TODO: catch key events and send them using sendkeys library

    // catching scroll events

    $(this).contents().on('scroll', function(event) {
        addScrollFrame(event, $(this).scrollTop());
    });

    // to only add new data twice a second

    setInterval(function() {
        enableScrollLogging = true;
    }, 1000 / fps);

    // catching load events (we are in load callback!)

    addLoadFrame(event, this.contentWindow.location.href);

    // send data every couple of seconds

    setInterval(sendBatchedData, 2000);

});