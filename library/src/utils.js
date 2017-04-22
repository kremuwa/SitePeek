sitePeek.utils = (function () {
    return {
        sendMessageToOrigin: function (targetWindow, message, targetOrigin) {
            var messageJSON = JSON.stringify(message);
            targetWindow.postMessage(messageJSON, targetOrigin);
        }
    }
})();