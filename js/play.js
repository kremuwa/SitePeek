// global variables

var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 3000;      // DEBUG (change value to 10 k in production) by how many miliseconds the playback will be delayed compared to the recording
var pointer = $('#pointer');
var scrollTop = 0;
var currentMouseX = 0;
var currentMouseY = 0;

function setCaretPosition(el, caretPos) {

    //noinspection SillyAssignmentJS
    el.value = el.value;
    // ^ this is used to not only get "focus", but
    // to make sure we don't have it everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)

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

            else  { // fail city, fortunately this never happens (as far as I've tested) :)
                el.focus();
                return false;
            }
        }
    }
}

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

    var playingFrame = $('#playing-frame');

    if(value.type == 'mousemove') {

        // move the image of mouse - parseFloat because some properties are text (from DB)
        // + 10 because of iframe's border

        currentMouseX = parseFloat(value.mouseX);
        currentMouseY = parseFloat(value.mouseY);

        pointer.offset({
            left: currentMouseX + playingFrame.offset().left + 10,
            top: currentMouseY + playingFrame.offset().top - scrollTop + 10
        });
    }
    else {

        if(value.type == 'click') {

            // -10 because we want the click circle to be centered

            $('<div class="clicktrace"></div>')
                .insertAfter(pointer)
                .offset({
                    left: parseFloat(value.mouseX) + playingFrame.offset().left - 10,
                    top: parseFloat(value.mouseY) + playingFrame.offset().top - scrollTop - 10
                })
                .fadeOut(2000, 'easeOutQuint', function() {
                    $(this).remove();
                });

            playingFrame.contents().find(value.target).trigger('click');
        }
        else if(value.type == 'focusin') {

            playingFrame.contents().find(value.target).trigger('focus');

        }
        else if(value.type == 'focusout') {

            playingFrame.contents().find(value.target).trigger('blur');

        }
        else if(value.type == 'text') {

            var target = playingFrame.contents().find(value.target);

            target.val(value.text);
            setCaretPosition(target[0], value.caret);

        }
        else if(value.type == 'scroll') {

            // TODO handle horizontal scrolling, too

            scrollTop = value.scrollTop;

            playingFrame.contents().find('body').scrollTop(scrollTop);

        }
        else if(value.type == 'resize') {

            playingFrame.css({
                'width': value.width,
                'height': value.height
            })

        }
        else if(value.type == 'load') {

            playingFrame[0].contentWindow.location.href = value.href;

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

    $(window).on('scroll', function(){

        console.log('scrolling');

        //fix pointer position

        var playingFrame = $('#playing-frame');

        pointer.offset({
            left: currentMouseX + playingFrame.offset().left + 10,
            top: currentMouseY + playingFrame.offset().top - scrollTop + 10
        });

    });

});
