$(document).ready(function(){

    var enableHandler;

    $(window).mousemove(function(event){

        if(enableHandler)
        {
            $('#mousePosX').text(event.pageX);
            $('#mousePosY').text(event.pageY);

            $.ajax({
                
                url: "php/record.php",
                data: {
                    mouseX: event.pageX,
                    mouseY: event.pageY
                },
                
                type: "POST",

                dataType : "html",

                success: function( text ) {

                    // do nothing

                },

                // DEBUG
                error: function( xhr, status, errorThrown ) {
                    alert( "Sorry, there was a problem!" );
                    console.log( "Error: " + errorThrown );
                    console.log( "Status: " + status );
                    console.dir( xhr );
                }
            });

            enableHandler = false;
        }

    });

    setInterval(function(){
        enableHandler = true;
    }, 100);

});
