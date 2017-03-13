// global variables
var testspaceId = null;
var scrollTop = 0; // TODO remove after making sure it's not needed for panning
var zoom = 1;
var userAppeared = false;
var pointerDown = false;
var testspaceUrl = null;
var currentRemoteUrl = null;
var playingFrame = $('#playing-frame');
var panzoomLayer = $('#panzoom-layer');
var wrapper = $('#wrapper');

/**
 * Checks if the user agent of the current browser indicates that the script is being run on a mobile device.
 */
function mobilecheck() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

/**
 * For a given URL, returns a string consisting of protocol and domain.
 * E.g. for 'https://facebook.com/username' returns 'https://facebook.com'
 */
function extractOrigin(url) {
    var protocolLastCharIdx = url.indexOf("://") + 3;
    var finishingSlashIdx = url.indexOf('/', protocolLastCharIdx + 1);
    return url.substr(0, finishingSlashIdx);
}

function sendMessageToOrigin(targetWindow, message, targetOrigin) {
    var messageJSON = JSON.stringify(message);
    targetWindow.postMessage(messageJSON, targetOrigin);
}

function centerViewOnCursor(currentMouseX, currentMouseY) {
    var matrix = panzoomLayer.panzoom('getMatrix');
    var panX = parseFloat(wrapper.css('width')) / 2 - currentMouseX;
    var panY = parseFloat(wrapper.css('height')) / 2 - (currentMouseY - scrollTop);
    // x and y translations respectively
    matrix[4] = panX;
    matrix[5] = panY;
    panzoomLayer.panzoom('setMatrix', matrix, {
        animate: true
    });
}

/**
 * Begin the countdown before showing the actions of the watched user to the moderator
 *
 * @param timeout - the time that is left for interesting things to start happening
 * on the screen. It's the same timeout that is set for the first load frame
 * to be executed in the player
 */
function beginCountdown(timeout) {
    // code of the countdown, i is initialized to 1000 (and time is i - 1000)
    // in order to count one second less (to leave some time for fading effect
    // of the player)
    for (var i = 1000; i < timeout; i += 1000) {
        setTimeout(function (i) {
            return function () {
                $('#counter').text(Math.floor((timeout - i) / 1000));
            }
        }(i), i - 1000)
    }
    // when the countdown ends...
    setTimeout(function () {
        $('#stage5').fadeOut(400, function () {
            $('#stage6').fadeIn(400);
        });
    }, timeout - 1000);
    // show the countdown after both stages are hidden
    // it can happen during stage4 and 7, so we hide that stages
    $('#stage4, #stage7')
        .fadeOut(400)
        .promise().done(function () {
        $('#stage5').fadeIn(400);
    });
    userAppeared = true;
}

$(document).ready(function () {
    $('#generate').on('click', function () {
        $('#stage2').fadeOut(400, function () {
            $('#preparation-frame')[0].contentWindow.location.href = 'about:blank';
            $('#stage3').fadeIn(400, function () {
                $.ajax({
                    url: "ajax/addTestspace.php",
                    data: {
                        url: currentRemoteUrl
                    },
                    dataType: "text",
                    type: "POST",
                    success: function (addedTestspaceId) {
                        testspaceId = addedTestspaceId;
                        testspaceUrl =
                            window.location.protocol
                            + "//"
                            + window.location.hostname
                            + "/testspace.php"
                            + '?id=' + testspaceId;
                        // fill in both the inputs at once
                        $('#copybox1').add('#copybox2').find('input')
                            .val(testspaceUrl);
                        $('.whatsapp-send-btn').attr('href', 'whatsapp://send?text=' + encodeURIComponent(testspaceUrl));
                        $('#stage3').fadeOut(400, function () {
                            $('#stage4').fadeIn(400, function () {
                                $('#copybox1').find('input')
                                    .trigger('focus')
                                    .select();
                            });
                        });
                        // notify the site to start fetching frames and execute related actions
                        var msgStartPlaying = {
                            type: 'startPlaying',
                            testspaceId: testspaceId
                        };
                        sendMessageToOrigin(
                            playingFrame[0].contentWindow,
                            msgStartPlaying,
                            extractOrigin(siteStartAddress)
                        );
                    }
                });
            });
        });
        // to prevent default event action and its propagation
        return false;
    });
    $('.again').on('click', function () {
        // going to the stage2 and initializing some things
        $('#stage6, #stage7')
            .fadeOut(400)
            .promise().done(function () {
            $('#stage2').fadeIn(400, function () {
                $('#dialog1').dialog('open');
                userAppeared = false;
                playingFrame[0].contentWindow.location.href = "about:blank";
            });
        });
        return false;
    });
    // ==== stage 4 (playing) ====
    var panzoom = $('#panzoom-layer').panzoom({
        $set: $('#playing-frame, #panzoom-layer'),
        contain: 'invert',
        maxScale: 1,
        onZoom: centerViewOnCursor,
        easing: 'linear'
    });
    wrapper.on('mousewheel.focal', function (e) {
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
        'panzoomstart': function () {
            pointerDown = true;
        },
        'panzoomend': function () {
            pointerDown = false;
            centerViewOnCursor();
        }
    });
    // send button doesn't work on mobiles
    if (!mobilecheck()) {
        $('.fb-send-btn').show();
    } else {
        $('.whatsapp-send-btn').show();
    }
});

$(window).on('resize', function () {
    // clever reusing - resize to the same size :)
    // TODO probably copy the code below to library and send it a message to execute it
    // var frame = $('#playing-frame');
    //
    // executeEvent({
    //     type: 'resize',
    //     width: parseFloat(frame.css('width')),
    //     height: parseFloat(frame.css('height'))
    // });
});

$('.fb-send-btn').on('click', function () {
    console.log(testspaceUrl);
    FB.ui({
        method: 'send',
        link: testspaceUrl
    });
    return false;
});

$('.fb-share-btn').on('click', function () {
    console.log(testspaceUrl);
    FB.ui({
        method: 'share',
        href: testspaceUrl
    }, function (response) {
    });
    return false;
});

$(window).on("message", function (event) {

    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== extractOrigin(siteStartAddress))
        return;
    var data = event.data || event.originalEvent.data;
    var source = event.source || event.originalEvent.source;
    var receivedMessage = JSON.parse(data);
    // checking for message type
    if (receivedMessage.type == 'currentUrl') {
        // this message is sent when new page is loaded on watched site.
        // Depending on current stage, various actions should be taken
        if (!userAppeared) {
            currentRemoteUrl = receivedMessage.currentUrl;
        } else {
            var msgStartPlaying = {
                type: 'startPlaying',
                testspaceId: testspaceId
            };
            sendMessageToOrigin(source, msgStartPlaying, extractOrigin(siteStartAddress));
        }
    } else if (receivedMessage.type == 'beginCountdown') {
        beginCountdown(receivedMessage.timeout);
    } else if (receivedMessage.type == 'centerViewOnCursor') {
        // if we're not panning at the moment...
        if (!pointerDown) {
            centerViewOnCursor(receivedMessage.currentMouseX, receivedMessage.currentMouseY);
        }
    } else if (receivedMessage.type == 'windowResized') {
        var width = receivedMessage.width;
        var height = receivedMessage.height;
        // resize playing frame and its layer
        playingFrame.add(panzoomLayer).css({
            'width': width,
            'height': height
        });
        // to make all the screen visible at once
        zoom = Math.min($(window).width() / width, ($(window).height() - wrapper.position().top) / height);
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
    }
});
