// global variables

var playgroundId = null;
var lastTimestamp = 0;      // using this variable we will ask PHP for more data after last timestamp
var playDelay = 10000;      // DEBUG (change value to 10 k in production) by how many miliseconds the playback will be delayed compared to the recording
var scrollTop = 0;
var currentMouseX = 0;
var currentMouseY = 0;
var zoom = 1;
var noLoadEventsInPlaygroundYet = true;
var userAppeared = false;
var pointerDown = false;
var getDataTimeout = null;
var preview = true;
var link = null;

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

function mobilecheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
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
        animate: !preview
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
        error: function( /* PRODUCTION xhr, status, errorThrown */ ) {
            /* PRODUCTION
            console.log( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );

            getDataTimeout = setTimeout(getData, 2000);*/
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
            timeout = value.timestamp - 1434564652775;

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

    // show the countdown after both stages are hidden
    // it can happen during stage4 and 7, so we hide that stages

    $('#stage4, #stage7')
        .fadeOut(400)
        .promise().done(function(){
            $('#stage5').fadeIn(400);
        });

    // clear the iframe

    $('#playing-frame')[0].contentWindow.location.href = "about:blank";

    // mark that user has appeared and also set noLoadEventsInPlaygroundYet to true

    userAppeared = true;
    noLoadEventsInPlaygroundYet = true;

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
        // needed only for first page load

        // smart way to reuse my code :)

        scrollTop = 0;
            
        if(noLoadEventsInPlaygroundYet) {

            executeEvent({
                type: 'resize',
                width: value.width,
                height: value.height
            });

            noLoadEventsInPlaygroundYet = false;

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

				// select only if we're not on mobile

				if(!mobilecheck())
				{
					$('#copybox2').find('input')
						.trigger('focus')
						.select()
				}

            });
        });

    }
    else if(value.type == 'secondvisitor') {


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

    console.log('test');

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

    $( "#dialog2" ).dialog({
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
            'Understood.': function() {
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

                        // PRODUCTION url = window.location.href + '?id=' + playgroundId;

						url = 'http://celebrities24.tk/?id=' + playgroundId;

                        // fill in both the inputs at once

                        $('#copybox1').add('#copybox2').find('input')
                            .val(url);
                        $('.whatsapp-send-btn').attr('href', 'whatsapp://send?text=' + encodeURIComponent(url));

                        link = url;

                        $('#stage3').fadeOut(400, function() {
                            $('#stage4').fadeIn(400, function() {
                                $('#copybox1').find('input')
                                    .trigger('focus')
                                    .select();
                                $('#dialog2').dialog('open');
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

        // don't execute the function if we just cleared the frame

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

    // send button doesn't work on mobiles

    if(!mobilecheck()) {
        $('.fb-send-btn').show();
    } else {
        $('.whatsapp-send-btn').show();
    }

});

$(window).on('resize', function(){

    // clever reusing - resize to the same size :)

    var frame = (preview ? $('#preview-frame') : $('#playing-frame'));

    executeEvent({
        type: 'resize',
        width: parseFloat(frame.css('width')),
        height: parseFloat(frame.css('height'))
    });

    // adjust dialogs width to new window width

    $( "#dialog1, #dialog2" ).dialog({
        width: Math.min($(window).width() * 0.8, 500)
    });

});

$('.fb-send-btn').on('click', function(){

    console.log(link);

    FB.ui({
        method: 'send',
        link: link
    });

    return false;
});

$('.fb-share-btn').on('click', function(){

    console.log(link);

    FB.ui({
        method: 'share',
        href: link
    }, function(response){});

    return false;
});