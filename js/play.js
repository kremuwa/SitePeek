// global variables

var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 10000;      // by how many miliseconds the playback will be delayed compared to the recording

function getCurrentTimestamp () {
    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
    }

    return Date.now(); // the result is in ms
}

function getData() {

    $.ajax({

        url: "ajax/getFrames.php",
        data: {
            lastTimestamp: lastTimestamp
        },
        dataType: "text",

        type: "POST",

        success: function( json ) {

            var events = JSON.parse(json);

            // if some events were delivered...

            if(events.length != 0) {

                // save the timestamp of most recent frame received from the server

                lastTimestamp = events[events.length - 1].timestamp;

                scheduleEvents(events);

                events.length = 0;

            }

            setTimeout(getData, 2000);

        },
        // DEBUG
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );

            setTimeout(getData, 2000);
        }
    });

}

function scheduleEvents( events ) {

    $.each(events, function (index, value) {

        // parseInt because in PHP the value from database was parsed as a string

        var timeout = parseInt(value.timestamp) + playDelay - getCurrentTimestamp();

        setTimeout(function() { moveMouse(value) }, (timeout > 0 ? timeout : 0));

    });

}

function moveMouse( value ) {

    // move the image of mouse

    $('#pointer').offset({
        left: value.mouseX,
        top: value.mouseY
    });

}

$(document).ready(function(){

    setTimeout(getData, 2000);

});
