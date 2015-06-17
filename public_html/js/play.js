// global variables

var playgroundId = null;
var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 10000;      // DEBUG (change value to 10 k in production) by how many miliseconds the playback will be delayed compared to the recording
var scrollTop = 0;
var currentMouseX = 0;
var currentMouseY = 0;
var zoom = 1;
var firstTime = true;
var userAppeared = false;
var pointerDown = false;
var getDataTimeout = null;
var preview = true;

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

    var panzoomLayer = (preview ? $('#preview-panzoom-layer') : $('#panzoom-layer'));
    var wrapper = (preview ? $('#preview-wrapper') : $('#wrapper'));

    var matrix = panzoomLayer.panzoom('getMatrix');

    var panX = parseFloat(wrapper.css('width')) / 2 - currentMouseX;
    var panY = parseFloat(wrapper.css('height')) / 2 - (currentMouseY - scrollTop);

    // x and y translations respectively

    matrix[4] = panX;
    matrix[5] = panY;

    panzoomLayer.panzoom('setMatrix', matrix, {
        animate: false
    });
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

            if(!preview)
                getDataTimeout = setTimeout(getData, 2000);

        },
        // DEBUG
        error: function( xhr, status, errorThrown ) {
            console.log( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );

            getDataTimeout = setTimeout(getData, 2000);
        }
    });

}

function scheduleEvents( frames ) {

    $.each(frames, function (index, value) {

        // parseInt because in PHP the value from database was sent as a string

        var timeout = 0;

        if(!preview)
            timeout = playDelay - (getCurrentTimestamp() - parseInt(value.timestamp));
        else
            timeout = value.timestamp - 1434564693775;

        setTimeout(function() { executeEvent(value) }, (timeout > 0 ? timeout : 0));

        // load event means user presence, so detect it and count down
        // (unless we are in preview)

        if(!preview && !userAppeared && (value.type == 'load'))
            beginCountdown(timeout);

        // unload event means we can catch new load events

        if(value.type == 'unload') {

            // allow new user to come

            userAppeared = false;

        }
    });

}

/**
 *
 * timeout - the time that is left for interesting things to start happening
 * on the screen. It's the same timeout that is set for the first load event
 *  to be played in the player
 *
 */

function beginCountdown(timeout) {

    // code of the countdown, i is initialized to 1000 (and time is i - 1000)
    // in order to count one second less (to leave some time for fading effect
    // of the player)

    for(var i = 1000; i < timeout; i += 1000) {
        setTimeout(function(i){
            return function(){
                $('#counter').text(Math.floor((timeout - i) / 1000));
            }
        }(i), i - 1000)
    }

    // when the countdown ends...

    setTimeout(function() {
        $('#stage5').fadeOut(400, function() {
            $('#stage6').fadeIn(400);
        });
    }, timeout - 1000);

    // show the countdown - it can happen during stage4 and 7, so we hide that stages

    $('#stage4, #stage7')
        .fadeOut(400)
        .promise().done(function(){
            $('#stage5').fadeIn(400);
        });

    // clear the iframe

    $('#playing-frame')[0].contentWindow.location.href = "about:blank";

    // I know it should be as a fadeOut callback, but I'm not sure of its behaviour
    // when there are two items faded

  //  setTimeout(function() {
   // }, 450);

    userAppeared = true;

}

function executeEvent( value ) {

    // caching

    var playingFrame = (preview ? $('#preview-frame') : $('#playing-frame'));

    var pointer = playingFrame.contents().find('#pointer');
    var panzoomLayer = (preview ? $('#preview-panzoom-layer') : $('#panzoom-layer'));
    var wrapper = (preview ? $('#preview-wrapper') : $('#wrapper'));

    if(value.type == 'mousemove') {

        // move the image of mouse - parseFloat because some properties are text (from DB)

        currentMouseX = value.mouseX;
        currentMouseY = value.mouseY;

        pointer.offset({
            left: parseFloat(currentMouseX),
            top: parseFloat(currentMouseY)
        });

        // if we're not panning at the moment...

        if(!pointerDown)
            centerViewOnCursor();

    }
    else if(value.type == 'click') {

        // -15 because we want the click circle to be centered

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

        //playingFrame.contents().find(value.target).trigger('focus');

    }
    else if(value.type == 'focusout') {

        //playingFrame.contents().find(value.target).trigger('blur');

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

        // resize playing frame and its layer

        playingFrame.add(panzoomLayer).
            css({
                'width': value.width,
                'height': value.height
            });

        if(!preview) {


            // to make all the screen visible at once

            zoom = Math.min($(window).width() / value.width, ($(window).height() - wrapper.position().top) / value.height);

            // only zoom if we don't have enough space

            if (zoom > 1) {
                zoom = 1;
                $('#zoominfo').fadeOut(400);
            }
            else
                $('#zoominfo').fadeIn(400);

            wrapper.css('height', $(window).height() - wrapper.position().top);

            panzoomLayer
                .panzoom('option', {
                    minScale: zoom
                })
                .panzoom('resetDimensions')
                .panzoom('zoom', zoom, {
                    focal: {clientX: 0, clientY: 0}
                });

        } else {

            // to contain source in the browser

            zoom = Math.max($(window).width() / value.width, ($(window).height()) / value.height);

            panzoomLayer
                .panzoom('resetDimensions');

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
            
        if(firstTime) {

            executeEvent({
                type: 'resize',
                width: value.width,
                height: value.height
            });

            firstTime = false;

        }

    }
    else if(value.type == 'unload') {

        // if a new user appeared before we managed to
        // replay this frame, we won't do it at all

        if(userAppeared)
            return false;

        // show the information that the user is gone

        $('#stage6').fadeOut(400, function() {
            $('#stage7').fadeIn(400, function() {

                $('#copybox2').find('input')
                    .trigger('focus')
                    .select()

            });
        });

    }
    else if(value.type == 'secondvisitor') {

        console.log('bla');

        // show the information that a second user came
        // while the first one was being recorded

        $('#message-box').fadeIn(400, function(){

            setTimeout(function(){

                $('#message-box').fadeOut(400);

            }, 8000)

        });

    }

    // loop the preview if last event was played

    if(preview && value.timestamp == '1434564778421') {
        getData();
    }

}

$(document).ready(function(){

    // ==== stages 1-5 (preparation) ====

    // get all the data for preview-frame in one batch

    playgroundId = 'preview-frame';
    getData();

    // set preview-frame to be contained in browser window

    $('#preview-panzoom-layer').panzoom({
        $set: $('#preview-frame, #preview-panzoom-layer'),
        contain: 'invert',
        disablePan: true,
        easing: 'linear'
    });

    $('#start').on('click', function() {

        // hacky way to stop showing things on preview-frame

        var id = window.setTimeout(function() {}, 0);

        // we're not showing preview frame anymore

        while (id--) {
            window.clearTimeout(id); // will do nothing if no timeout with id is present
        }

        playgroundId = null;
        preview = false;

        $('#stage1').fadeOut(400, function() {
            $('#stage2').fadeIn(400, function() {
                $('#dialog1').dialog('open');
            });
        });

        return false;

    });

    $( "#dialog1" ).dialog({
        autoOpen: false,
        modal: true,
        show: {
            effect: 'fade',
            duration: 400
        },
        hide: {
            effect: 'fade',
            duration: 400
        },
        buttons: {
            'Ok, got it!': function() {
                $(this).dialog('close');
            }
        },
        width: Math.min($(window).width() * 0.8, 500)
    });

    $('#generate').on('click', function(){

        $('#stage2').fadeOut(400, function() {
            $('#stage3').fadeIn(400, function() {

                $.ajax({

                    url: "ajax/addPlayground.php",
                    data: {
                        url: $('#preparation-frame')[0].contentWindow.location.href
                    },
                    dataType: "text",

                    type: "POST",

                    success: function( json ) {

                        playgroundId = json;
                        url = window.location.href + '?id=' + playgroundId;

                        // fill in both the inputs at once

                        $('#copybox1').add('#copybox2').find('input')
                            .val(url);
                        $('.whatsapp').attr('data-href', url);

                        $('#stage3').fadeOut(100, function() {
                            $('#stage4').fadeIn(100, function() {
                                $('#copybox1').find('input')
                                    .trigger('focus')
                                    .select()
                            });
                        });

                        // start fetching data

                        getDataTimeout = setTimeout(getData, 4000);

                    },
                    // DEBUG
                    error: function( xhr, status, errorThrown ) {
                        console.log( "Sorry, there was a problem!" );
                        console.log( "Error: " + errorThrown );
                        console.log( "Status: " + status );
                        console.dir( xhr );
                    }
                });

            });
        });

        // to prevent default event action and its propagation

        return false;
    });

    $('.again').on('click', function(){

        // going to the stage2 and initializing some things

        $('#stage6, #stage7')
            .fadeOut(400)
            .promise().done(function() {

                $('#stage2').fadeIn(400, function() {

                    clearTimeout(getDataTimeout);
                    $('#dialog1').dialog('open');
                    userAppeared = false;
                    playingFrame[0].contentWindow.location.href = "about:blank";

                });

            });

        return false;
    });

    // ==== stage 4 (playing) ====

    var playingFrame = $('#playing-frame');

    // custom easing effect for hiding clicktraces

    $.extend($.easing,
    {
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        }
    });

    playingFrame.add('#preview-frame').on('load', function(){

        // don't execute the function it if we just cleared the frame

        if($(this)[0].contentWindow.location.href == 'about:blank')
            return;

        $('<div id="pointer"></div>')
            .css({
                'background': 'transparent url(\'../img/cursor.png\') left top no-repeat',
                'height': '20px',
                'width': '20px',
                'position': 'absolute',
                'z-index': '10001'
            })
            .offset({
                left: parseFloat(currentMouseX),
                top: parseFloat(currentMouseY)
            })
            .appendTo($(this).contents().find('body'));

        $(this).contents().find('a').on('click', function(e){

            // so that triggering click event in "click" frame handling on link
            // doesn't navigate (as we already navigate on load frames)

            if($(this).attr('rel') != 'shadowbox') // (in shadowboxed links we want to let default action)
                e.preventDefault();

        });

    });

    var panzoom = $('#panzoom-layer').panzoom({
        $set: $('#playing-frame, #panzoom-layer'),
        contain: 'invert',
        maxScale: 1,
        onZoom: centerViewOnCursor,
        easing: 'linear'
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

    panzoom.on({
        'panzoomstart': function() {
            pointerDown = true;
        },
        'panzoomend': function() {
            pointerDown = false;
            centerViewOnCursor();
        }
    });

});

$(window).on('resize', function(){

    var panzoomLayer = (preview ? $('#preview-panzoom-layer') : $('#panzoom-layer'));

    if(!preview)
        $('#wrapper').css('height', $(window).height() - $('#wrapper').position().top);

    panzoomLayer.panzoom('resetDimensions');

});