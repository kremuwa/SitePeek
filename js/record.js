// global variables

var enableHandler = false;
var frames = [];
var fps = 50; // more is nonsense

function getCurrentTimestamp () {
    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
    }

    return Date.now(); // the result is in ms
}

function addData(event) {

    if(enableHandler) {
        $('#mousePosX').text(event.pageX);
        $('#mousePosY').text(event.pageY);

        // add new frame

        frames[frames.length] = {
            timestamp: getCurrentTimestamp(),
            mouseX: event.pageX,
            mouseY: event.pageY
        };

        enableHandler = false;
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
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    });

    // clear the frames buffer (hopefully after stringification)

    frames.length = 0;

}

$(document).ready(function() {

    $("#recording-frame").contents().find('body').on('mousemove',function(event) {
        alert($("#recording-frame"));
        addData (event);
    });

    $('#overlay').one('click', handleClick);

    /*$('#recording-frame').on('click', function(event){
        console.log('kliknieto na ramke');
        //event.stopPropagation();
    });*/

    // to only add new data every 100 ms

    setInterval(function() {
        enableHandler = true;
    }, 1000 / fps);

    setInterval(sendBatchedData, 2000);

});

function handleClick(event) {

    // DEBUG
    console.log(event.target);
    console.log(event.currentTarget);

    var overlay = $('#overlay');
    var e = new $.Event("click");

    e.pageX = event.pageX;
    e.pageY = event.pageY;

    overlay.addClass('pointer-events-none');
    overlay.trigger(e);
    console.log('clicked');

}