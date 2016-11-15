'use strict';

setInterval(function(){
    checkForNotification();
},5000);

var checkForNotification = function(){
    var redFav = chrome.extension.getURL("images/fiverr-red.png");
    var oldFav = "https://www.fiverr.com/favicon.ico";
    if ($("li[data-gtm-label='inbox']").hasClass("marked")){
        $("link[rel='shortcut icon']").attr("href", redFav);
    }
    else{
        $("link[rel='shortcut icon']").attr("href", oldFav);
    }
};