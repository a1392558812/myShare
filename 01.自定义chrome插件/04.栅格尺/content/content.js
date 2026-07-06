(function () {
  'use strict';

  if (window.__wbGridRulerInjected) return;
  window.__wbGridRulerInjected = true;

  const OVERLAY_CLASS = 'wb-grid-ruler-overlay';
  const HANDLE_CLASS = 'wb-grid-ruler-handle';
  const ROTATE_HANDLE_CLASS = 'wb-grid-ruler-rotate-handle';
  const STORAGE_KEY = 'wbGridRulerSettings';
  const HANDLE_SIZE = 14;
  const ROTATE_HANDLE_DIST = 36;

  const DEFAULTS = {
    enabled: true,
    mountTarget: 'body',
    xGap: 100,
    yGap: 100,
    gridColor: 'rgba(200,204,208,1)',
    gridThickness: 1,
    showXGrid: true,
    showYGrid: true,
    overlayZIndex: 2147483647,
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    referenceLines: [],
    showMouseIndicator: false,
    indicatorColor: 'rgba(0,188,212,0.7)',
    indicatorThickness: 1,
    indicatorFontColor: 'rgba(255,255,255,1)',
    indicatorFontSize: 11
  };

  let settings = JSON.parse(JSON.stringify(DEFAULTS));
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let targetEl = null;
  let domHandles = [];
  let isDragging = false;
  let dragMode = null;
  let activeLineIdx = -1;
  let mouseX = -1;
  let mouseY = -1;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function getDpr() { return window.devicePixelRatio || 1; }
  function getVpW() { return window.innerWidth; }
  function getVpH() { return window.innerHeight; }

  function getContentOrigin() {
    if (!targetEl) return { ox: 0, oy: 0 };
    if (targetEl === document.body) {
      return {
        ox: settings.paddingLeft - window.pageXOffset,
        oy: settings.paddingTop - window.pageYOffset
      };
    }
    const r = targetEl.getBoundingClientRect();
    return {
      ox: r.left + settings.paddingLeft - targetEl.scrollLeft,
      oy: r.top + settings.paddingTop - targetEl.scrollTop
    };
  }

  async function init() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        settings = Object.assign(deepClone(DEFAULTS), result[STORAGE_KEY]);
      }
    } catch (e) { }

    chrome.storage.onChanged.addListener(onStorageChanged);
    if (settings.enabled) createOverlay();
  }

  function onStorageChanged(changes, area) {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    const next = changes[STORAGE_KEY].newValue;
    if (!next) return;

    const prevMount = settings.mountTarget;
    const prevRefLen = settings.referenceLines.length;
    const prevZIndex = settings.overlayZIndex;
    const prevShowIndicator = settings.showMouseIndicator;
    Object.assign(settings, next);

    if (!settings.enabled) { destroyOverlay(); return; }
    if (prevMount !== settings.mountTarget || prevRefLen !== settings.referenceLines.length || !overlay) {
      rebuildOverlay();
    } else {
      if (prevZIndex !== settings.overlayZIndex && overlay) {
        overlay.style.zIndex = settings.overlayZIndex;
      }
      if (prevShowIndicator !== settings.showMouseIndicator) {
        if (settings.showMouseIndicator) {
          document.addEventListener('mousemove', onMouseMove, { passive: true });
        } else {
          document.removeEventListener('mousemove', onMouseMove);
          mouseX = -1;
          mouseY = -1;
        }
      }
      render();
    }
  }

  function createOverlay() {
    if (overlay) destroyOverlay();
    targetEl = resolveTarget();
    if (!targetEl) { console.warn('[栅格尺] 找不到挂载目标:', settings.mountTarget); return; }

    overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:' + settings.overlayZIndex + ';overflow:hidden;';
    canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    resizeCanvas();
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (targetEl !== document.body && (targetEl.scrollHeight > targetEl.clientHeight || targetEl.scrollWidth > targetEl.clientWidth)) {
      targetEl.addEventListener('scroll', onScroll, { passive: true });
    }

    createAllDomHandles();
    if (settings.showMouseIndicator) {
      document.addEventListener('mousemove', onMouseMove, { passive: true });
    }
    render();
  }

  function destroyOverlay() {
    if (isDragging) cancelDrag();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    if (targetEl && targetEl !== document.body) targetEl.removeEventListener('scroll', onScroll);
    document.removeEventListener('mousemove', onMouseMove);
    removeAllDomHandles();
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; canvas = null; ctx = null; targetEl = null;
  }

  function rebuildOverlay() { destroyOverlay(); if (settings.enabled) createOverlay(); }

  function resolveTarget() {
    if (settings.mountTarget === 'body' && document.body) return document.body;
    try { return document.querySelector(settings.mountTarget); } catch (e) { return null; }
  }

  function onResize() { resizeCanvas(); render(); }
  function onScroll() { render(); }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    render();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = getDpr();
    const w = getVpW();
    const h = getVpH();
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  function render() {
    if (!ctx || !canvas) return;
    const dpr = getDpr();
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    const pT = settings.paddingTop;
    const pR = settings.paddingRight;
    const pB = settings.paddingBottom;
    const pL = settings.paddingLeft;
    const co = getContentOrigin();

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    drawRulerBackgrounds(w, h, pT, pR, pB, pL);
    drawGrid(w, h, pL, pT, pR, pB, co);
    drawRulers(w, h, pT, pR, pB, pL, co);
    drawReferenceLines(pL, pT, pR, pB, w, h, co);
    if (settings.showMouseIndicator) {
      drawMouseIndicator(w, h, pL, pT, pR, pB);
    }
    ctx.restore();

    updateAllDomHandles(co);
  }

  function drawRulerBackgrounds(w, h, pT, pR, pB, pL) {
    ctx.fillStyle = '#f2f3f5';
    if (pT > 0) ctx.fillRect(0, 0, w, pT);
    if (pB > 0) ctx.fillRect(0, h - pB, w, pB);
    if (pL > 0) ctx.fillRect(0, pT, pL, h - pT - pB);
    if (pR > 0) ctx.fillRect(w - pR, pT, pR, h - pT - pB);
    if (pT > 0 && pL > 0) ctx.fillRect(0, 0, pL, pT);
    if (pT > 0 && pR > 0) ctx.fillRect(w - pR, 0, pR, pT);
    if (pB > 0 && pL > 0) ctx.fillRect(0, h - pB, pL, pB);
    if (pB > 0 && pR > 0) ctx.fillRect(w - pR, h - pB, pR, pB);
    ctx.strokeStyle = '#d5d8dc';
    ctx.lineWidth = 1;
    ctx.strokeRect(pL - 0.5, pT - 0.5, w - pL - pR + 1, h - pT - pB + 1);
  }

  function drawGrid(vpW, vpH, pL, pT, pR, pB, co) {
    const { xGap, yGap, gridColor, gridThickness, showXGrid, showYGrid } = settings;
    if (!targetEl) return;
    if ((!showXGrid || xGap <= 0) && (!showYGrid || yGap <= 0)) return;

    let cW, cH;
    if (targetEl === document.body) {
      cW = Math.max(document.documentElement.scrollWidth || 0, document.documentElement.clientWidth || 0, vpW);
      cH = Math.max(document.documentElement.scrollHeight || 0, document.documentElement.clientHeight || 0, vpH);
    } else {
      cW = targetEl.scrollWidth || targetEl.clientWidth;
      cH = targetEl.scrollHeight || targetEl.clientHeight;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(pL, pT, vpW - pL - pR, vpH - pT - pB);
    ctx.clip();

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;
    ctx.beginPath();

    if (showXGrid) {
      for (let x = 0; x <= cW - pL - pR; x += xGap) {
        const vx = co.ox + x;
        ctx.moveTo(vx + 0.5, pT);
        ctx.lineTo(vx + 0.5, vpH - pB);
      }
    }
    if (showYGrid) {
      for (let y = 0; y <= cH - pT - pB; y += yGap) {
        const vy = co.oy + y;
        ctx.moveTo(pL, vy + 0.5);
        ctx.lineTo(vpW - pR, vy + 0.5);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  function drawRulers(vpW, vpH, pT, pR, pB, pL, co) {
    const { xGap, yGap } = settings;
    if (xGap <= 0 || yGap <= 0) return;

    const MIN_LINE = 5;
    const labelStep = Math.max(1, Math.ceil(35 / Math.min(xGap || 1, yGap || 1)));
    ctx.strokeStyle = '#a8aeb5';
    ctx.fillStyle = '#4a5056';
    ctx.lineWidth = 1;

    const topExt = pT >= MIN_LINE;
    const botExt = pB >= MIN_LINE;
    const leftExt = pL >= 10;
    const rightExt = pR >= 10;
    const fontSize = pT >= 12 || pB >= 12 || pL >= 12 || pR >= 12 ? 10 : 8;
    ctx.font = fontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    ctx.textAlign = 'center';
    ctx.textBaseline = topExt ? 'bottom' : 'top';
    for (let x = 0; ; x += xGap) {
      const vx = co.ox + x;
      if (vx > vpW - pR) break;
      if (vx < pL) continue;
      const major = (Math.round(x / xGap)) % labelStep === 0;
      const edgeY = topExt ? pT : 0;
      const len = major ? Math.max(MIN_LINE, (topExt ? pT : 10) * 0.55) : Math.max(MIN_LINE, (topExt ? pT : 10) * 0.3);
      const y2 = topExt ? edgeY - len : edgeY + len;
      ctx.beginPath();
      ctx.moveTo(vx, edgeY);
      ctx.lineTo(vx, y2);
      ctx.stroke();
      if (major) ctx.fillText(String(x + pL), vx, topExt ? y2 - 2 : y2 + 2);
    }

    const by = vpH - pB;
    const botEdge = botExt ? by : vpH;
    ctx.textAlign = 'center';
    ctx.textBaseline = botExt ? 'top' : 'bottom';
    for (let x = 0; ; x += xGap) {
      const vx = co.ox + x;
      if (vx > vpW - pR) break;
      if (vx < pL) continue;
      const major = (Math.round(x / xGap)) % labelStep === 0;
      const len = major ? Math.max(MIN_LINE, (botExt ? pB : 10) * 0.55) : Math.max(MIN_LINE, (botExt ? pB : 10) * 0.3);
      const y2 = botExt ? botEdge + len : botEdge - len;
      ctx.beginPath();
      ctx.moveTo(vx, botEdge);
      ctx.lineTo(vx, y2);
      ctx.stroke();
      if (major) ctx.fillText(String(x + pL), vx, botExt ? y2 + 2 : y2 - 2);
    }

    ctx.textAlign = leftExt ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    for (let y = 0; ; y += yGap) {
      const vy = co.oy + y;
      if (vy > vpH - pB) break;
      if (vy < pT) continue;
      const major = (Math.round(y / yGap)) % labelStep === 0;
      const edgeX = leftExt ? pL : 0;
      const len = major ? Math.max(MIN_LINE, (leftExt ? pL : 10) * 0.55) : Math.max(MIN_LINE, (leftExt ? pL : 10) * 0.3);
      const x2 = leftExt ? edgeX - len : edgeX + len;
      ctx.beginPath();
      ctx.moveTo(edgeX, vy);
      ctx.lineTo(x2, vy);
      ctx.stroke();
      if (major) ctx.fillText(String(y + pT), leftExt ? x2 - 3 : x2 + 3, vy);
    }

    const rx = vpW - pR;
    const rEdge = rightExt ? rx : vpW;
    ctx.textAlign = rightExt ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; ; y += yGap) {
      const vy = co.oy + y;
      if (vy > vpH - pB) break;
      if (vy < pT) continue;
      const major = (Math.round(y / yGap)) % labelStep === 0;
      const len = major ? Math.max(MIN_LINE, (rightExt ? pR : 10) * 0.55) : Math.max(MIN_LINE, (rightExt ? pR : 10) * 0.3);
      const x2 = rightExt ? rEdge + len : rEdge - len;
      ctx.beginPath();
      ctx.moveTo(rEdge, vy);
      ctx.lineTo(x2, vy);
      ctx.stroke();
      if (major) ctx.fillText(String(y + pT), rightExt ? x2 + 3 : x2 - 3, vy);
    }
  }

  function drawReferenceLines(pL, pT, pR, pB, vpW, vpH, co) {
    const cArea = { l: pL, t: pT, r: vpW - pR, b: vpH - pB };
    for (let i = 0; i < settings.referenceLines.length; i++) {
      const line = settings.referenceLines[i];
      const rad = (line.angle || 0) * Math.PI / 180;
      const px = co.ox + line.x;
      const py = co.oy + line.y;
      const color = line.color || '#e74c3c';
      const thickness = line.thickness || 2;

      const pts = calcLineIntersections(px, py, rad, cArea.l, cArea.t, cArea.r - cArea.l, cArea.b - cArea.t);
      if (pts.length < 2) continue;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();

      const labelX = clamp((pts[0].x + pts[1].x) / 2, cArea.l + 20, cArea.r - 20);
      const labelY = clamp((pts[0].y + pts[1].y) / 2, cArea.t + 14, cArea.b - 4);
      drawLineLabel(labelX, labelY, i + 1, color);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      const hx = px - ROTATE_HANDLE_DIST * Math.sin(rad);
      const hy = py + ROTATE_HANDLE_DIST * Math.cos(rad);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawMouseIndicator(vpW, vpH, pL, pT, pR, pB) {
    if (mouseX < 0 || mouseY < 0) return;

    ctx.save();

    ctx.strokeStyle = settings.indicatorColor;
    ctx.lineWidth = settings.indicatorThickness;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mouseX + 0.5, 0);
    ctx.lineTo(mouseX + 0.5, vpH);
    ctx.moveTo(0, mouseY + 0.5);
    ctx.lineTo(vpW, mouseY + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    const sx = window.scrollX || window.pageXOffset || 0;
    const sy = window.scrollY || window.pageYOffset || 0;
    const text = Math.round(mouseX + sx) + ', ' + Math.round(mouseY + sy);
    ctx.font = 'bold ' + settings.indicatorFontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const metrics = ctx.measureText(text);
    const pw = metrics.width + 10;
    const ph = settings.indicatorFontSize + 8;

    let lx = mouseX + 16;
    let ly = mouseY + 18;
    if (lx + pw > vpW) lx = mouseX - pw - 16;
    if (ly + ph > vpH) ly = mouseY - ph - 8;

    ctx.fillStyle = settings.indicatorColor;
    ctx.beginPath();
    roundRect(ctx, lx, ly, pw, ph, 4);
    ctx.fill();

    ctx.fillStyle = settings.indicatorFontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, lx + pw / 2, ly + ph / 2);

    ctx.restore();
  }

  function calcLineIntersections(px, py, rad, pL, pT, cW, cH) {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const points = [];

    if (Math.abs(cos) < 1e-6) {
      if (px >= pL && px <= pL + cW) points.push({ x: px, y: pT }, { x: px, y: pT + cH });
      return points;
    }
    if (Math.abs(sin) < 1e-6) {
      if (py >= pT && py <= pT + cH) points.push({ x: pL, y: py }, { x: pL + cW, y: py });
      return points;
    }

    const slope = sin / cos;
    const left = pL, right = pL + cW, top = pT, bottom = pT + cH;

    const xTop = px + (top - py) / slope;
    if (xTop >= left && xTop <= right) points.push({ x: xTop, y: top });
    const xBot = px + (bottom - py) / slope;
    if (xBot >= left && xBot <= right) points.push({ x: xBot, y: bottom });
    const yLeft = py + (left - px) * slope;
    if (yLeft >= top && yLeft <= bottom) points.push({ x: left, y: yLeft });
    const yRight = py + (right - px) * slope;
    if (yRight >= top && yRight <= bottom) points.push({ x: right, y: yRight });

    const uniq = [];
    for (const p of points) {
      if (!uniq.some(q => Math.abs(q.x - p.x) < 0.5 && Math.abs(q.y - p.y) < 0.5)) uniq.push(p);
    }
    return uniq.slice(0, 2);
  }

  function drawLineLabel(x, y, num, color) {
    const text = String(num);
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const m = ctx.measureText(text);
    const pw = m.width + 8;
    const ph = 16;
    const rx = x - pw / 2;
    const ry = y - ph / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    roundRect(ctx, rx, ry, pw, ph, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function createAllDomHandles() {
    removeAllDomHandles();
    for (let i = 0; i < settings.referenceLines.length; i++) createDomHandlesForLine(i);
  }

  function createDomHandlesForLine(index) {
    const line = settings.referenceLines[index];
    const color = line.color || '#e74c3c';

    const pos = document.createElement('div');
    pos.className = HANDLE_CLASS;
    pos.dataset.lineIndex = index;
    pos.dataset.type = 'position';
    pos.style.cssText = [
      'width:' + HANDLE_SIZE + 'px;height:' + HANDLE_SIZE + 'px;',
      'background:#fff;border:2.5px solid ' + color + ';',
      'border-radius:50%;cursor:grab;pointer-events:auto;',
      'box-shadow:0 1px 4px rgba(0,0,0,0.25);z-index:2;',
      'position:fixed;transform:translate(-50%,-50%);'
    ].join('');

    const rot = document.createElement('div');
    rot.className = ROTATE_HANDLE_CLASS;
    rot.dataset.lineIndex = index;
    rot.dataset.type = 'rotation';
    rot.style.cssText = [
      'width:' + (HANDLE_SIZE - 2) + 'px;height:' + (HANDLE_SIZE - 2) + 'px;',
      'background:#fff;border:2.5px solid #666;',
      'border-radius:50%;cursor:crosshair;pointer-events:auto;',
      'box-shadow:0 1px 4px rgba(0,0,0,0.25);z-index:2;',
      'position:fixed;transform:translate(-50%,-50%);'
    ].join('');

    pos.addEventListener('mousedown', onHandleMouseDown);
    rot.addEventListener('mousedown', onHandleMouseDown);
    overlay.appendChild(pos);
    overlay.appendChild(rot);

    domHandles.push({ index, position: pos, rotation: rot });
  }

  function removeAllDomHandles() {
    for (const h of domHandles) {
      if (h.position.parentNode) h.position.remove();
      if (h.rotation.parentNode) h.rotation.remove();
    }
    domHandles = [];
  }

  function updateAllDomHandles(co) {
    for (const h of domHandles) {
      const line = settings.referenceLines[h.index];
      if (!line) continue;
      const rad = (line.angle || 0) * Math.PI / 180;
      const px = co.ox + line.x;
      const py = co.oy + line.y;
      h.position.style.left = px + 'px';
      h.position.style.top = py + 'px';
      h.rotation.style.left = (px - ROTATE_HANDLE_DIST * Math.sin(rad)) + 'px';
      h.rotation.style.top = (py + ROTATE_HANDLE_DIST * Math.cos(rad)) + 'px';
    }
  }

  function onHandleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt(e.currentTarget.dataset.lineIndex);
    const type = e.currentTarget.dataset.type;
    if (isNaN(idx) || idx >= settings.referenceLines.length) return;

    isDragging = true;
    dragMode = type;
    activeLineIdx = idx;

    const h = domHandles.find(handle => handle.index === idx);
    if (h && type === 'position') h.position.style.cursor = 'grabbing';

    document.addEventListener('mousemove', onDocumentMouseMove, { passive: false });
    document.addEventListener('mouseup', onDocumentMouseUp);
  }

  function onDocumentMouseMove(e) {
    if (!isDragging || activeLineIdx < 0) return;
    const line = settings.referenceLines[activeLineIdx];
    if (!line) { cancelDrag(); return; }

    const co = getContentOrigin();
    const pL = settings.paddingLeft;
    const pT = settings.paddingTop;
    const pR = settings.paddingRight;
    const pB = settings.paddingBottom;
    const vpW = getVpW();
    const vpH = getVpH();

    let cW, cH;
    if (targetEl === document.body) {
      cW = Math.max(document.documentElement.scrollWidth || 0, vpW);
      cH = Math.max(document.documentElement.scrollHeight || 0, vpH);
    } else {
      cW = targetEl.scrollWidth || targetEl.clientWidth;
      cH = targetEl.scrollHeight || targetEl.clientHeight;
    }

    if (dragMode === 'position') {
      const cx = e.clientX - co.ox;
      const cy = e.clientY - co.oy;
      line.x = Math.round(clamp(cx, 0, cW - pL - pR));
      line.y = Math.round(clamp(cy, 0, cH - pT - pB));
    } else if (dragMode === 'rotation') {
      const mx = e.clientX - (co.ox + line.x);
      const my = e.clientY - (co.oy + line.y);
      let angle = Math.atan2(my, mx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      if (angle >= 360) angle -= 360;
      line.angle = Math.round(angle);
    }

    persistSettings();
    render();
  }

  function onDocumentMouseUp() { cancelDrag(); }

  function cancelDrag() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
    if (activeLineIdx >= 0) {
      const h = domHandles.find(handle => handle.index === activeLineIdx);
      if (h) h.position.style.cursor = 'grab';
    }
    isDragging = false;
    dragMode = null;
    activeLineIdx = -1;
  }

  function persistSettings() {
    try { chrome.storage.local.set({ [STORAGE_KEY]: deepClone(settings) }); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
