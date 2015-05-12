/**
 * Created by kremuwa on 2015-05-07.
 */
var page = require('webpage').create(),
    system = require('system'),
    address, pathToIframeWrapper;

pathToIframeWrapper = system.args[1];
address = system.args[2];

page.onUrlChanged = function(targetUrl) {
    console.log("URL Change to: " + targetUrl);
};

page.open(pathToIframeWrapper + '?url=' + address, function(status) {
    if (status !== 'success') {
        console.log('error');
        phantom.exit();
    } else {
        setTimeout(function(){
            console.log('false');
            phantom.exit();
        }, 5000);
    }
});