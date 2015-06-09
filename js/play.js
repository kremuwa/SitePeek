// global variables

var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 4000;      // DEBUG (change value to 10 k in production) by how many miliseconds the playback will be delayed compared to the recording
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

function centerViewOnCursor() {

    var panzoomLayer = $('#panzoom-layer');
    var wrapper = $('#wrapper');

    var matrix = panzoomLayer.panzoom('getMatrix');

    var panX = parseFloat(wrapper.css('width')) / 2 - currentMouseX;
    var panY = parseFloat(wrapper.css('height')) / 2 - (currentMouseY - scrollTop);

    // x and y translations respectively

    matrix[4] = panX;
    matrix[5] = panY;

    panzoomLayer.panzoom('setMatrix', matrix);
}

function getData() {

    $.ajax({

        url: "ajax/getFrames.php",
        data: {
            lastTimestamp: lastTimestamp,
            playgroundId: playgroundId
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

    // caching

    var playingFrame = $('#playing-frame');
    var pointer = playingFrame.contents().find('#pointer');
    var panzoomLayer = $('#panzoom-layer');
    var wrapper = $('#wrapper');

    if(value.type == 'mousemove') {

        // move the image of mouse - parseFloat because some properties are text (from DB)

        currentMouseX = value.mouseX;
        currentMouseY = value.mouseY;

        pointer.offset({
            left: parseFloat(currentMouseX),
            top: parseFloat(currentMouseY)
        });

        centerViewOnCursor();
        
    }
    else if(value.type == 'click') {

        // +10 (not +30) because we want the click circle to be centered

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
                left: parseFloat(currentMouseX) - 15,
                top: parseFloat(currentMouseY) - 15
            })
            .appendTo(playingFrame.contents().find('body'))
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

        var $wrapper = wrapper;

        // to make all the screen visible at once

        zoom = Math.min($(window).width() / value.width, ($(window).height() - $wrapper.position().top) / value.height);

        console.log(zoom);

        // resize playing frame and it's layer

        playingFrame.add(panzoomLayer).
            css({
                'width': value.width,
                'height': value.height
            });

        // fix panzoom layer position

        //panzoomLayer.offset(playingFrame.offset());

        // only zoom if we don't have enough space

        if(zoom < 1) {

            $wrapper.css('height', $(window).height() - $wrapper.position().top);

            panzoomLayer
                .panzoom('option', {
                    minScale: zoom
                })
                .panzoom('resetDimensions')
                .panzoom('zoom', zoom, {
                    focal: {clientX: 0, clientY: 0}
                });

        }

    }
    else if(value.type == 'load') {

        playingFrame[0].contentWindow.location.href = value.href;

        // newly loaded website has to be resized too, in order to
        // fit in viewer's browser width.
        // Probably needed only for first page load, but just in case
        // we do it every time

        // smart way to reuse my code :)

        scrollTop = 0;

        executeEvent({
            type: 'resize',
            width: value.width,
            height: value.height
        });

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

    $('#playing-frame').on('load', function(){

        $('<div id="pointer"></div>')
            .css({
                'background': 'transparent url(\'../img/cursor.png\') left top no-repeat',
                'height': '20px',
                'width': '20px',
                'position': 'absolute',
                'z-index': '10001'
            })
            .appendTo($('#playing-frame').contents().find('body'))

    });

    var panzoom = $('#panzoom-layer').panzoom({
        $set: $('#playing-frame, #panzoom-layer'),
        disablePan: true,
        contain: 'invert',
        maxScale: 1,
        onZoom: centerViewOnCursor
    });

    $('#wrapper').on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        panzoom.panzoom('zoom', zoomOut, {
            increment: 0.05,
            animate: false,
            focal: e
        });
    });

});
