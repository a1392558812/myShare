
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' })
      .then((dataUrl) => {
        sendResponse({ dataUrl });
      })
      .catch((e) => {
        console.error('截图失败:', e);
        sendResponse({ error: e.message });
      });
    return true;
  }
});
