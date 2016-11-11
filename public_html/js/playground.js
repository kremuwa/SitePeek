function extractOrigin(url) {

    var protocolLastCharIdx = url.indexOf("://") + 3;
    var finishingSlashIdx = url.indexOf('/', protocolLastCharIdx + 1);

    return url.substr(0, finishingSlashIdx);
}

$(window).on("message", function (event) {

    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.

    if (origin !== extractOrigin(playgroundUrl))
        return;

    var source = event.source || event.originalEvent.source;

    var message = {
        'type': 'startPutting',
        'playgroundId': playgroundId
    };

    var messageJSON = JSON.stringify(message);

    source.postMessage(messageJSON, extractOrigin(playgroundUrl));
});