// global variables

var enableHandler = false;
var events = [];
var fps = 50; // more is nonsense

function getCurrentTimestamp () {
    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
    }

    return Date.now(); // the result is in ms
}

function addData(event) {

    if(enableHandler) {
        jQuery('#mousePosX').text(event.pageX);
        jQuery('#mousePosY').text(event.pageY);

        // add new event

        events[events.length] = {
            timestamp: getCurrentTimestamp(),
            mouseX: event.pageX,
            mouseY: event.pageY
        };

        enableHandler = false;
    }

}

/* performed every 5 seconds; sends data from an array to the server */

function sendBatchedData() {

    jQuery.ajax({

        url: "../ajax/putFrames.php",
        data: {
            events: JSON.stringify(events)
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

    // clear the events buffer (hopefully after stringification)

    events.length = 0;

}

jQuery(document).ready(function() {

    jQuery(window).on('mousemove',function(event) {
        addData (event);
    });

    jQuery('#overlay').one('click', handleClick);

    /*jQuery('#recording-frame').on('click', function(event){
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

    var overlay = jQuery('#overlay');
    var e = new jQuery.Event("click");

    e.pageX = event.pageX;
    e.pageY = event.pageY;

    overlay.addClass('pointer-events-none');
    overlay.trigger(e);
    console.log('clicked');

}