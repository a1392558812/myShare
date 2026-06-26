
(function () {
  'use strict';

  if (window.__screenshotContentLoaded) return;
  window.__screenshotContentLoaded = true;

  let overlay, selection, toolbar, hint, infoEl;
  let isDrawing = false;
  let isDragging = false;
  let isResizing = false;
  let resizeDir = '';
  let startX = 0, startY = 0;
  let dragOffsetX = 0, dragOffsetY = 0;
  let rect = { x: 0, y: 0, width: 0, height: 0 };
  let resizeSnapshot = null;

  const MIN_SIZE = 10;

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.cropPending && changes.cropPending.newValue === true) {
      chrome.storage.local.remove('cropPending');
      startCropMode();
    }
  });

  const startCropMode = () => {
    if (document.getElementById('__screenshot-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = '__screenshot-overlay';
    document.body.appendChild(overlay);

    selection = document.createElement('div');
    selection.id = '__screenshot-selection';

    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((dir) => {
      const h = document.createElement('div');
      h.className = 'ss-handle';
      h.dataset.dir = dir;
      selection.appendChild(h);
    });

    infoEl = document.createElement('div');
    infoEl.id = '__screenshot-info';
    selection.appendChild(infoEl);

    overlay.appendChild(selection);

    toolbar = document.createElement('div');
    toolbar.id = '__screenshot-toolbar';
    toolbar.innerHTML = `
      <button id="__btn-confirm">✔ 截图</button>
      <button id="__btn-cancel">✕ 取消</button>
    `;
    overlay.appendChild(toolbar);
    toolbar.style.display = 'none';

    hint = document.createElement('div');
    hint.id = '__screenshot-hint';
    hint.textContent = '拖拽鼠标选择截图区域  ·  ESC 取消';
    document.body.appendChild(hint);

    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);
    document.addEventListener('keydown', onKeyDown, true);

    document.getElementById('__btn-confirm').addEventListener('click', confirmCapture);
    document.getElementById('__btn-cancel').addEventListener('click', cleanup);
  }

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (!overlay || !overlay.contains(e.target)) return;

    const target = e.target;

    if (target.closest('#__screenshot-toolbar')) return;

    if (target.classList.contains('ss-handle')) {
      isResizing = true;
      resizeDir = target.dataset.dir;
      resizeSnapshot = { ...rect };
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (selection && selection.style.display !== 'none' &&
        target === selection) {
      isDragging = true;
      dragOffsetX = e.clientX - rect.x;
      dragOffsetY = e.clientY - rect.y;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (target === overlay) {
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      rect = { x: startX, y: startY, width: 0, height: 0 };
      if (selection) selection.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
      if (hint) hint.style.display = 'none';
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const onMouseMove = (e) => {
    if (!overlay) return;
    if (isDrawing) {
      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);
      rect = { x, y, width: w, height: h };
      applyRect();
      e.preventDefault();
      return;
    }

    if (isDragging) {
      let nx = e.clientX - dragOffsetX;
      let ny = e.clientY - dragOffsetY;
      nx = Math.max(0, Math.min(nx, window.innerWidth - rect.width));
      ny = Math.max(0, Math.min(ny, window.innerHeight - rect.height));
      rect.x = nx;
      rect.y = ny;
      applyRect();
      e.preventDefault();
      return;
    }

    if (isResizing) {
      applyResize(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }
  }

  const onMouseUp = (e) => {
    if (e.button !== 0) return;
    if (!overlay) return;

    if (isDrawing) {
      isDrawing = false;
      if (rect.width > MIN_SIZE && rect.height > MIN_SIZE) {
        selection.style.display = 'block';
        showToolbar();
      }
      e.preventDefault();
      return;
    }

    if (isDragging) {
      isDragging = false;
      showToolbar();
      e.preventDefault();
      return;
    }

    if (isResizing) {
      isResizing = false;
      resizeDir = '';
      resizeSnapshot = null;
      showToolbar();
      e.preventDefault();
      return;
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') cleanup();
    if (e.key === 'Enter') confirmCapture();
  }

  const applyRect = () => {
    selection.style.display = 'block';
    selection.style.left = rect.x + 'px';
    selection.style.top = rect.y + 'px';
    selection.style.width = rect.width + 'px';
    selection.style.height = rect.height + 'px';
    if (infoEl) {
      infoEl.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    }
  }

  const showToolbar = () => {
    toolbar.style.display = 'flex';
    const tbH = 36;
    const margin = 8;
    let ty = rect.y + rect.height + margin;
    if (ty + tbH > window.innerHeight) {
      ty = rect.y - tbH - margin;
    }
    let tx = rect.x + rect.width - toolbar.offsetWidth;
    if (tx < 0) tx = rect.x;
    toolbar.style.left = tx + 'px';
    toolbar.style.top = ty + 'px';
  }

  const applyResize = (cx, cy) => {
    const snap = resizeSnapshot;
    const dx = cx - startX;
    const dy = cy - startY;
    let { x, y, width, height } = snap;

    switch (resizeDir) {
      case 'nw': x += dx; y += dy; width -= dx; height -= dy; break;
      case 'n':  y += dy; height -= dy; break;
      case 'ne': y += dy; width += dx; height -= dy; break;
      case 'e':  width += dx; break;
      case 'se': width += dx; height += dy; break;
      case 's':  height += dy; break;
      case 'sw': x += dx; width -= dx; height += dy; break;
      case 'w':  x += dx; width -= dx; break;
    }

    if (width < MIN_SIZE) {
      if (['nw', 'sw', 'w'].includes(resizeDir)) {
        x = snap.x + snap.width - MIN_SIZE;
      }
      width = MIN_SIZE;
    }
    if (height < MIN_SIZE) {
      if (['nw', 'ne', 'n'].includes(resizeDir)) {
        y = snap.y + snap.height - MIN_SIZE;
      }
      height = MIN_SIZE;
    }

    x = Math.max(0, x);
    y = Math.max(0, y);
    if (x + width > window.innerWidth) width = window.innerWidth - x;
    if (y + height > window.innerHeight) height = window.innerHeight - y;

    rect = { x, y, width, height };
    applyRect();
  }

  const confirmCapture = () => {
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) return;

    const cropRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    const dpr = window.devicePixelRatio || 1;

    cleanup();

    requestAnimationFrame(() => {
      chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
        if (!response || !response.dataUrl) {
          console.error('截图失败：未收到 background 返回的图片数据');
          return;
        }
        cropAndDownload(response.dataUrl, cropRect, dpr);
      });
    });
  }

  const cropAndDownload = (dataUrl, cropRect, dpr) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cropRect.width * dpr);
      canvas.height = Math.round(cropRect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        Math.round(cropRect.x * dpr),
        Math.round(cropRect.y * dpr),
        Math.round(cropRect.width * dpr),
        Math.round(cropRect.height * dpr),
        0, 0,
        Math.round(cropRect.width * dpr),
        Math.round(cropRect.height * dpr)
      );
      canvas.toBlob(async (blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert('图片已复制到剪贴板，可粘贴到工具');

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFilename('crop');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, 'image/png');
    };
    img.onerror = () => console.error('图片加载失败，无法裁剪');
    img.src = dataUrl;
  }

  const cleanup = () => {
    if (overlay) { overlay.remove(); overlay = null; }
    if (hint) { hint.remove(); hint = null; }
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseup', onMouseUp, true);
    document.removeEventListener('keydown', onKeyDown, true);
    selection = null;
    toolbar = null;
    infoEl = null;
    isDrawing = isDragging = isResizing = false;
  }

  const generateFilename = (suffix = 'full') => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `screenshot_${suffix}_${ts}.png`;
  }

  window.__startScreenshotCrop = startCropMode;

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'startCrop') {
      startCropMode();
      sendResponse({ ok: true });
    }
    return true;
  });

})();
