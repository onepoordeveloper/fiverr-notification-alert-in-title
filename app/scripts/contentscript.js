'use strict';

setInterval(function(){
    checkForNotification();
},5000);

var checkForNotification = function(){
    var redFav = chrome.extension.getURL("images/fiverr-red.png");
    var oldFav = "https://www.fiverr.com/favicon.ico";
    if ($(".marked").length > 0){
        $("link[rel='shortcut icon']").attr("href", redFav);
    }
    else{
        $("link[rel='shortcut icon']").attr("href", oldFav);
    }
};