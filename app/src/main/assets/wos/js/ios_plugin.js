var console = {};
console.log = function (msg) {
    webkit.messageHandlers.consoleLog.postMessage(JSON.stringify(msg));
};

window.addEventListener('error', function(e) {
    console.log(JSON.stringify(e));
});