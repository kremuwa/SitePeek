function extractOrigin(url) {
    var protocolLastCharIdx = url.indexOf("://") + 3;
    var finishingSlashIdx = url.indexOf('/', protocolLastCharIdx + 1);
    return url.substr(0, finishingSlashIdx);
}

$(window).on("message", function (event) {
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== extractOrigin(testspaceUrl)) // testspaceUrl is defined as global variable in testpace.php
        return;
    var source = event.source || event.originalEvent.source;
    var data = event.data || event.originalEvent.data;
    var receivedMessage = JSON.parse(data);
    console.log(receivedMessage);
    var message = {
        'type': 'startPutting',
        'testspaceId': testspaceId // testspaceId is defined as global variable in testpace.php
    };
    var messageJSON = JSON.stringify(message);
    // testspaceUrl is defined as global variable in testpace.php
    source.postMessage(messageJSON, extractOrigin(testspaceUrl));
});