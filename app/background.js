function injectScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['inject.js'],
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && !tab.url.startsWith("chrome://")) {
        if (tab.active && changeInfo.status === "complete") {
            injectScript(tabId);
        }
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && !tab.url.startsWith("chrome://")) {
            injectScript(activeInfo.tabId);
        }
    });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove('websiteName', () => {
        console.log('Website data removed from local storage');
    });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove('warningsShown', () => {
      console.log('Warning data removed from local storage');
    });
  });
