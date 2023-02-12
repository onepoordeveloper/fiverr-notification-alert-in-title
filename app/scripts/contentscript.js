'use strict';

setInterval(function () {
    checkForNotification();
}, 5000);

var checkForNotification = function () {
    var redFav = chrome.extension.getURL("images/fiverr-red.png");
    var oldFav = "https://www.fiverr.com/favicon.ico";
    if ($(".unread-icon").length > 0) {
        $("link[rel*='icon']").attr("href", redFav);
    }
    else {
        $("link[rel*='icon']").attr("href", oldFav);
    }
};
