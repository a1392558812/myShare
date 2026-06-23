
document.getElementById('btnFullscreen').addEventListener('click', async () => {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    await chrome.downloads.download({
      url: dataUrl,
      filename: generateFilename('full'),
      saveAs: false
    });
  } catch (e) {
    console.error('全屏截图失败:', e);
  }
  window.close();
});

document.getElementById('btnCrop').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let started = false;

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (typeof window.__startScreenshotCrop === 'function') {
          window.__startScreenshotCrop();
          return true;
        }
        return false;
      }
    });
    if (result && result.result === true) started = true;
  } catch (_) { }

  if (!started) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'startCrop' });
      started = true;
    } catch (_) { }
  }

  if (!started) {
    await chrome.storage.local.set({ cropPending: true });
  }

  window.close();
});

function generateFilename(suffix = 'full') {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `screenshot_${suffix}_${ts}.png`;
}
