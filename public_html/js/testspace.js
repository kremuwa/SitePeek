function extractOrigin(url) {
    var protocolLastCharIdx = url.indexOf("://") + 3;
    var finishingSlashIdx = url.indexOf('/', protocolLastCharIdx + 1);
    return url.substr(0, finishingSlashIdx);
}

function notifyWatcherIfDidnt() {
    // TODO right now this function doesn't work
    // perform only the first time the user is seeing unload communicate
    if (!userIsLeaving) {

        // TODO remove if all the functions above work without the lines below
        // var confirmationMessage = "Are you sure you want to leave?";
        // (event || window.event).returnValue = confirmationMessage;     // Gecko and Trident
        // return confirmationMessage;
    }
}

function init() {
    // not sure why not use jQuery here, but I was told by internet not to
    window.addEventListener('beforeunload', notifyWatcherIfDidnt);
}

$(window).on("message", function (event) {
    // receive the message sent by child frame when its document is ready
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== extractOrigin(testspaceUrl)) // testspaceUrl is defined as global variable in testpace.php
        return;
    var source = event.source || event.originalEvent.source;
    var message = {
        'type': 'startPutting',
        'testspaceId': testspaceId // testspaceId is defined as global variable in testpace.php
    };
    var messageJSON = JSON.stringify(message);
    // testspaceUrl is defined as global variable in testpace.php
    source.postMessage(messageJSON, extractOrigin(testspaceUrl));
});

init();