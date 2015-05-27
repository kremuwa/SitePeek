// global variables

var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 3000;      // DEBUG (change value to 10 k in production) by how many miliseconds the playback will be delayed compared to the recording
var pointer = $('#pointer');
var scrollTop = 0;

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

            var frames = JSON.parse(json);

            // if some frames were delivered...

            if(frames.length != 0) {

                // save the timestamp of most recent frame received from the server

                lastTimestamp = frames[frames.length - 1].timestamp;

                scheduleEvents(frames);

                frames.length = 0;

            }

            setTimeout(getData, 2000);

        },
        // DEBUG
        error: function( xhr, status, errorThrown ) {
            console.log( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );

            setTimeout(getData, 2000);
        }
    });

}

function scheduleEvents( frames ) {

    $.each(frames, function (index, value) {

        // parseInt because in PHP the value from database was parsed as a string

        var timeout = parseInt(value.timestamp) + playDelay - getCurrentTimestamp();

        setTimeout(function() { executeEvent(value) }, (timeout > 0 ? timeout : 0));

    });

}

function executeEvent( value ) {

    // move the image of mouse

    if(value.type == 'mousemove') {

        pointer.offset({
            left: value.mouseX,
            top: value.mouseY - scrollTop
        });
    }
    else {

        var playingframe = $('#playing-frame');

        if(value.type == 'click') {

            $('<div class="clicktrace"></div>')
                .insertAfter(pointer)
                .offset({
                    left: value.mouseX - 20,
                    top: value.mouseY - scrollTop - 20
                })
                .fadeOut(2000, 'easeOutQuint', function() {
                    $(this).remove();
                });

            playingframe.contents().find(value.target).trigger('click');
        }
        else if(value.type == 'focusin') {

            playingframe.contents().find(value.target).trigger('focus');

        }
        else if(value.type == 'focusout') {

            playingframe.contents().find(value.target).trigger('blur');

        }
        else if(value.type == 'scroll') {

            scrollTop = value.scrollTop;

            playingframe.contents().find('body').scrollTop(scrollTop);

        }
        else if(value.type == 'load') {

            playingframe[0].contentWindow.location.href = value.href;

        }
    }

}

$(document).ready(function(){

    setTimeout(getData, 4000);

    // custom easing effect for hiding clicktraces

    $.extend($.easing,
    {
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        }
    });

});
