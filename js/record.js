// global variables

var enableMousemoveLogging = false;
var enableScrollLogging = false;
var frames = [];
var fps = 50; // more is nonsense

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

	// add new frame

	frames[frames.length] = {
        type: 'click',
		timestamp: event.timeStamp,
		mouseX: event.pageX,
		mouseY: event.pageY
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

$('#recordingFrame').load(function() {

    // cache

    var recordingFrame = $('#recordingFrame');

    // to only add new data every 100 ms

    setInterval(function() {
        enableMousemoveLogging = true;
        enableScrollLogging = true;
    }, 1000 / fps);

    // catching mousemove events

    recordingFrame.contents().find('body').on('mousemove', function(event) {
        addMousemoveFrame (event);
    });
	
    // catching click events

    recordingFrame.contents().find('body').on('click', function(event) {
        addClickFrame (event);
    });

    // catching scroll events

    recordingFrame.contents().on('scroll', function(event){
        addScrollFrame (event, $(this).scrollTop());
    });

    // send data every couple of seconds

    setInterval(sendBatchedData, 2000);

});