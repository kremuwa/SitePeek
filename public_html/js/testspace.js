var testspace = (function () {
    var frames = [];
    var enableResizeLogging = true;
    var fps = 50;
    var alreadyReceivedLoadFrame = false;
    
    var init = function () {
        $(window).on('message', handleMessages);
        startPutting();
        // not sure why not use jQuery here, but I was told by internet not to
        window.addEventListener('beforeunload', finalizeTestSession);
        // catching resize events
        $(window).on('resize', function () {
            addResizeFrame($(window).width(), $(window).height());
        });
        // to only add new resize frames once in a while
        setInterval(function () {
            enableResizeLogging = true;
        }, 1000 / fps);
    };

    var getCurrentTimestamp = function () {
        if (!Date.now) {
            Date.now = function () {
                return new Date().getTime();
            }
        }
        return Date.now(); // the result is in ms
    };

    var extractOrigin = function (url) {
        var protocolLastCharIdx = url.indexOf("://") + 3;
        var finishingSlashIdx = url.indexOf('/', protocolLastCharIdx + 1);
        return url.substr(0, finishingSlashIdx);
    };

    var sendMessageToOrigin = function (targetWindow, message, targetOrigin) {
        var messageJSON = JSON.stringify(message);
        targetWindow.postMessage(messageJSON, targetOrigin);
    };

    var finalizeTestSession = function () {
        // notify watcher about exit
        addUnloadFrame();
        putBatchedFrames(false); // synchronous ajax call
        unlockTestspace();
    };

    var addResizeFrame = function (width, height) {
        // the if is to limit the frequency of frames generation
        if (enableResizeLogging) {
            // add new frame
            frames[frames.length] = {
                type: 'resize',
                timestamp: getCurrentTimestamp(),
                width: width,
                height: height
            };
            enableResizeLogging = false;
        }
    };

    var addUnloadFrame = function () {
        frames[frames.length] = {
            type: 'unload',
            timestamp: getCurrentTimestamp()
        };
    };

    var putBatchedFrames = function (async) {
        async = (typeof async !== 'undefined' ? async : true); // true by default
        $.ajax({
            url: "/ajax/putFrames.php",
            data: {
                frames: JSON.stringify(frames),
                testspaceId: testspaceId
            },
            async: async,
            type: "POST",
            success: function () {
                putBatchedFrames();
            },
            // DEBUG
            error: function (xhr, status, errorThrown) {
                console.log("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            }
        });
        // clear the frames buffer
        frames.length = 0;
    };

    var startPutting = function () {
        putBatchedFrames();
    };

    var unlockTestspace = function () {
        $.ajax({
            url: "/ajax/unlockTestspace.php",
            data: {
                testspaceId: testspaceId
            },
            async: false, // because performing this call in beforeunload handler
            type: "POST",
            // DEBUG
            error: function (xhr, status, errorThrown) {
                console.log("Sorry, there was a problem!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            }
        });
    };

    var handleMessages = function () {
        var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
        if (origin !== extractOrigin(testspaceUrl)) // testspaceUrl is defined as global variable in testpace.php
            return;
        var source = event.source || event.originalEvent.source;
        var data = event.data || event.originalEvent.data;
        var receivedMessage = JSON.parse(data);
        // checking for message type
        if (receivedMessage.type == 'sitepeekLibLoaded') {
            var message = {
                type: 'testspaceReady'
            };
            sendMessageToOrigin(source, message, extractOrigin(testspaceUrl));
        } else if (receivedMessage.type == 'addFrame') {
            frames[frames.length] = receivedMessage.frame;
            if (receivedMessage.frame.type == 'load' && !alreadyReceivedLoadFrame) {
                alreadyReceivedLoadFrame = true;
                // adding one initial resize event for the playing frame to be of the right size
                addResizeFrame($(window).width(), $(window).height());
            }
        }
    };

    return {
        init: init
    };
})();