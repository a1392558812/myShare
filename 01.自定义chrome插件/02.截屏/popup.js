// popup.js - 弹窗交互逻辑
// 全屏截图由 popup 独立完成，区域截图通过 executeScript 触发 content 中的全局函数

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

  // 方式1：executeScript 直接调 content 暴露的全局函数（最可靠）
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
  } catch (_) { /* executeScript 失败，尝试下一种方式 */ }

  // 方式2：tabs.sendMessage 给已注入的 content script
  if (!started) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'startCrop' });
      started = true;
    } catch (_) { /* content script 未就绪 */ }
  }

  // 方式3：storage 标志作为最终备用
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
