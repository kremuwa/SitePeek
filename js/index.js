
$('#form').submit( function(event) {

        event.preventDefault();

        console.log("wywolano");
        var form = $(this);

        $('#xfo-check-fail').hide();
        $('#loading-img').show();

        $.ajax({

            url: 'ajax/checkXFO.php',

            type: 'GET',

            data: form.serialize(),

            success: function (text) {

                console.log("XFOtest: " + text); // DEBUG
                $('#loading-img').hide();

                if(text == "false") {

                    // HACK so hacky solution! form.submit didn't want to work!
                    form.unbind().find('[name="submit"]').click()

                } else {

                    $('#xfo-check-fail').show();

                }

            },

            // DEBUG
            error: function (xhr, status, errorThrown) {
                alert('Sorry, there was a problem!');
                console.log('Error: ' + errorThrown);
                console.log('Status: ' + status);
                console.dir(xhr);
            }
        });

});