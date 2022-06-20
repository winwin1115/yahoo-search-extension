
chrome.browserAction.onClicked.addListener(function(a){
    chrome.storage.local.get(["user_name"], function(res){
        if(res['user_name'] == undefined){
            chrome.tabs.create({
                url: 'theme/login.html'
            });
        }
        else{
            chrome.tabs.create({
                url: 'theme/index.html'
            });
        }
    });
});