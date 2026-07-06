(function () {
  'use strict';

  const STORAGE_KEY = 'wbGridRulerSettings';

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
  let debounceTimer = null;

  const $ = (id) => document.getElementById(id);

  const dom = {
    enabled: $('enabled'),
    mountTarget: $('mountTarget'),
    xGap: $('xGap'),
    yGap: $('yGap'),
    paddingTop: $('paddingTop'),
    paddingRight: $('paddingRight'),
    paddingBottom: $('paddingBottom'),
    paddingLeft: $('paddingLeft'),
    gridColor: $('gridColor'),
    gridThickness: $('gridThickness'),
    showXGrid: $('showXGrid'),
    showYGrid: $('showYGrid'),
    overlayZIndex: $('overlayZIndex'),
    addRefLine: $('addRefLine'),
    refLinesContainer: $('refLinesContainer'),
    settingsBody: $('settingsBody'),
    showMouseIndicator: $('showMouseIndicator'),
    indicatorColor: $('indicatorColor'),
    indicatorThickness: $('indicatorThickness'),
    indicatorFontColor: $('indicatorFontColor'),
    indicatorFontSize: $('indicatorFontSize')
  };

  async function init() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      settings = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), result[STORAGE_KEY]);
    }
    populateForm();
    bindEvents();
    renderRefLines();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[STORAGE_KEY]) return;
      const next = changes[STORAGE_KEY].newValue;
      if (!next) return;
      settings = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), next);
      populateForm();
      if (!isEditingRefLine()) {
        renderRefLines();
      }
    });
  }

  function isEditingRefLine() {
    if (!dom.refLinesContainer) return false;
    const active = document.activeElement;
    return dom.refLinesContainer.contains(active) && (active.tagName === 'INPUT' || active.tagName === 'BUTTON');
  }

  function populateForm() {
    dom.enabled.checked = settings.enabled;
    dom.mountTarget.value = settings.mountTarget;
    dom.xGap.value = settings.xGap;
    dom.yGap.value = settings.yGap;
    dom.paddingTop.value = settings.paddingTop;
    dom.paddingRight.value = settings.paddingRight;
    dom.paddingBottom.value = settings.paddingBottom;
    dom.paddingLeft.value = settings.paddingLeft;
    dom.gridThickness.value = settings.gridThickness;
    dom.showXGrid.checked = settings.showXGrid;
    dom.showYGrid.checked = settings.showYGrid;
    dom.overlayZIndex.value = settings.overlayZIndex;
    setRgbaPicker('gridColor', settings.gridColor);
    setRgbaPicker('indicatorColor', settings.indicatorColor);
    setRgbaPicker('indicatorFontColor', settings.indicatorFontColor);
    dom.showMouseIndicator.checked = settings.showMouseIndicator;
  }

  function bindEvents() {
    dom.enabled.addEventListener('change', () => {
      settings.enabled = dom.enabled.checked;
      save();
    });

    dom.mountTarget.addEventListener('input', debounceSave);

    const numInputs = [dom.xGap, dom.yGap, dom.paddingTop, dom.paddingRight,
      dom.paddingBottom, dom.paddingLeft, dom.gridThickness];

    for (const input of numInputs) {
      input.addEventListener('input', () => {
        const key = input.id;
        const val = parseFloat(input.value);
        settings[key] = isNaN(val) ? DEFAULTS[key] : Math.max(parseFloat(input.min || 0), val);
        save();
      });
      input.addEventListener('blur', () => {
        const key = input.id;
        if (input.value === '' || isNaN(parseFloat(input.value))) {
          input.value = settings[key];
        }
      });
    }

    dom.showXGrid.addEventListener('change', () => {
      settings.showXGrid = dom.showXGrid.checked;
      save();
    });
    dom.showYGrid.addEventListener('change', () => {
      settings.showYGrid = dom.showYGrid.checked;
      save();
    });

    bindRgbaPicker('gridColor');
    bindRgbaPicker('indicatorColor');
    bindRgbaPicker('indicatorFontColor');

    dom.overlayZIndex.addEventListener('input', () => {
      const val = parseInt(dom.overlayZIndex.value);
      settings.overlayZIndex = isNaN(val) || val < 0 ? DEFAULTS.overlayZIndex : val;
      save();
    });
    dom.overlayZIndex.addEventListener('blur', () => {
      if (dom.overlayZIndex.value === '' || isNaN(parseInt(dom.overlayZIndex.value))) {
        dom.overlayZIndex.value = settings.overlayZIndex;
      }
    });

    dom.addRefLine.addEventListener('click', addRefLine);
    dom.refLinesContainer.addEventListener('click', handleRefLineClick);
    dom.refLinesContainer.addEventListener('input', handleRefLineInput);
    dom.refLinesContainer.addEventListener('change', handleRefLineChange);

    dom.showMouseIndicator.addEventListener('change', () => {
      settings.showMouseIndicator = dom.showMouseIndicator.checked;
      save();
    });

    const indicatorNumInputs = [dom.indicatorThickness, dom.indicatorFontSize];
    for (const input of indicatorNumInputs) {
      input.addEventListener('input', () => {
        const key = input.id;
        const val = parseFloat(input.value);
        settings[key] = isNaN(val) ? DEFAULTS[key] : Math.max(parseFloat(input.min || 0), val);
        save();
      });
      input.addEventListener('blur', () => {
        const key = input.id;
        if (input.value === '' || isNaN(parseFloat(input.value))) {
          input.value = settings[key];
        }
      });
    }
  }

  function debounceSave() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      settings.mountTarget = dom.mountTarget.value.trim() || 'body';
      save();
    }, 400);
  }

  function parseRgba(rgbaStr) {
    const m = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      return {
        rgb: '#' + (+m[1]).toString(16).padStart(2,'0') + (+m[2]).toString(16).padStart(2,'0') + (+m[3]).toString(16).padStart(2,'0'),
        alpha: m[4] !== undefined ? Math.round(+m[4] * 100) : 100
      };
    }
    return { rgb: '#000000', alpha: 100 };
  }

  function mergeRgba(rgb, alpha) {
    const r = parseInt(rgb.slice(1,3), 16);
    const g = parseInt(rgb.slice(3,5), 16);
    const b = parseInt(rgb.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha / 100) + ')';
  }

  function setRgbaPicker(key, rgbaStr) {
    const hidden = document.getElementById(key);
    if (!hidden) return;
    hidden.value = rgbaStr;
    const picker = hidden.closest('.rgba-picker');
    if (!picker) return;
    const p = parseRgba(rgbaStr);
    const rgbInput = picker.querySelector('.rgba-rgb');
    const alphaInput = picker.querySelector('.rgba-alpha');
    const alphaLabel = picker.querySelector('.rgba-alpha-label');
    const preview = picker.querySelector('.rgba-preview');
    if (rgbInput) rgbInput.value = p.rgb;
    if (alphaInput) alphaInput.value = p.alpha;
    if (alphaLabel) alphaLabel.textContent = p.alpha + '%';
    if (preview) preview.style.background = rgbaStr;
  }

  function bindRgbaPicker(key) {
    const hidden = document.getElementById(key);
    if (!hidden) return;
    const picker = hidden.closest('.rgba-picker');
    if (!picker) return;
    const rgbInput = picker.querySelector('.rgba-rgb');
    const alphaInput = picker.querySelector('.rgba-alpha');
    const alphaLabel = picker.querySelector('.rgba-alpha-label');
    const preview = picker.querySelector('.rgba-preview');

    if (rgbInput) {
      rgbInput.addEventListener('input', function() {
        const val = mergeRgba(rgbInput.value, alphaInput ? +alphaInput.value : 100);
        hidden.value = val;
        settings[hidden.id] = val;
        if (preview) preview.style.background = val;
        save();
      });
    }
    if (alphaInput) {
      alphaInput.addEventListener('input', function() {
        if (alphaLabel) alphaLabel.textContent = alphaInput.value + '%';
        const val = mergeRgba(rgbInput ? rgbInput.value : '#000000', +alphaInput.value);
        hidden.value = val;
        settings[hidden.id] = val;
        if (preview) preview.style.background = val;
        save();
      });
    }
  }

  function save() {
    chrome.storage.local.set({ [STORAGE_KEY]: JSON.parse(JSON.stringify(settings)) });
  }

  function addRefLine() {
    const x = 100;
    const y = 100;
    const angle = 0;

    settings.referenceLines.push({
      x: x,
      y: y,
      angle: angle,
      color: lineColors[settings.referenceLines.length % lineColors.length],
      thickness: 2
    });

    save();
    renderRefLines();
  }

  function removeRefLine(index) {
    settings.referenceLines.splice(index, 1);
    save();
    renderRefLines();
  }

  const lineColors = [
    'rgba(231,76,60,1)', 'rgba(230,126,34,1)', 'rgba(46,204,113,1)', 'rgba(52,152,219,1)',
    'rgba(155,89,182,1)', 'rgba(26,188,156,1)', 'rgba(243,156,18,1)', 'rgba(233,30,99,1)'
  ];

  function renderRefLines() {
    const container = dom.refLinesContainer;
    container.innerHTML = '';

    if (settings.referenceLines.length === 0) {
      container.innerHTML = '<div style="color:#999;font-size:12px;text-align:center;padding:12px 0;">暂无参考线，点击 + 添加</div>';
      return;
    }

    for (let i = 0; i < settings.referenceLines.length; i++) {
      const line = settings.referenceLines[i];
      const card = createRefLineCard(i, line);
      container.appendChild(card);
    }
  }

  function createRefLineCard(index, line) {
    const card = document.createElement('div');
    card.className = 'ref-line-card';
    card.dataset.index = index;

    const p = parseRgba(line.color);

    card.innerHTML = `
      <div class="ref-line-card-header">
        <span class="line-label">参考线 ${index + 1}</span>
        <button class="btn-remove" data-action="remove" data-index="${index}" title="删除">&times;</button>
      </div>
      <div class="row-3">
        <div class="field">
          <label class="label">X坐标</label>
          <div class="input-with-unit">
            <input type="number" class="input num ref-field" data-index="${index}" data-field="x" value="${line.x}" min="0" step="1">
            <span class="unit">px</span>
          </div>
        </div>
        <div class="field">
          <label class="label">Y坐标</label>
          <div class="input-with-unit">
            <input type="number" class="input num ref-field" data-index="${index}" data-field="y" value="${line.y}" min="0" step="1">
            <span class="unit">px</span>
          </div>
        </div>
        <div class="field">
          <label class="label">角度</label>
          <div class="input-with-unit">
            <input type="number" class="input num ref-field" data-index="${index}" data-field="angle" value="${line.angle}" min="0" max="360" step="1">
            <span class="unit">°</span>
          </div>
        </div>
      </div>
      <div class="row-2">
        <div class="field">
          <label class="label">颜色</label>
          <div class="rgba-picker ref-rgba-picker" data-index="${index}">
            <div class="rgba-preview"></div>
            <input type="color" class="rgba-rgb" value="${p.rgb}">
            <div class="rgba-alpha-wrap">
              <input type="range" class="rgba-alpha" min="0" max="100" value="${p.alpha}">
              <span class="rgba-alpha-label">${p.alpha}%</span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">粗细</label>
          <div class="input-with-unit">
            <input type="number" class="input num ref-field" data-index="${index}" data-field="thickness" value="${line.thickness}" min="0.5" max="20" step="0.5">
            <span class="unit">px</span>
          </div>
        </div>
      </div>
    `;

    const picker = card.querySelector('.rgba-picker');
    const rgbInput = picker.querySelector('.rgba-rgb');
    const alphaInput = picker.querySelector('.rgba-alpha');
    const alphaLabel = picker.querySelector('.rgba-alpha-label');
    const preview = picker.querySelector('.rgba-preview');
    preview.style.background = line.color;

    rgbInput.addEventListener('input', () => {
      const val = mergeRgba(rgbInput.value, +alphaInput.value);
      settings.referenceLines[index].color = val;
      preview.style.background = val;
      save();
    });

    alphaInput.addEventListener('input', () => {
      alphaLabel.textContent = alphaInput.value + '%';
      const val = mergeRgba(rgbInput.value, +alphaInput.value);
      settings.referenceLines[index].color = val;
      preview.style.background = val;
      save();
    });

    return card;
  }

  function handleRefLineClick(e) {
    const target = e.target;
    if (target.dataset.action === 'remove') {
      const index = parseInt(target.dataset.index);
      if (!isNaN(index)) removeRefLine(index);
    }
  }

  function handleRefLineInput(e) {
    const target = e.target;
    if (!target.classList.contains('ref-field')) return;

    const index = parseInt(target.dataset.index);
    const field = target.dataset.field;
    if (isNaN(index) || !field) return;
    if (index >= settings.referenceLines.length) return;

    const line = settings.referenceLines[index];
    let val = target.type === 'color' ? target.value : parseFloat(target.value);

    if (target.type === 'number') {
      if (isNaN(val)) return;
      val = Math.max(parseFloat(target.min || 0), val);
    }

    line[field] = val;
    save();
  }

  function handleRefLineChange(e) {
    const target = e.target;
    if (!target.classList.contains('ref-field')) return;

    const index = parseInt(target.dataset.index);
    const field = target.dataset.field;
    if (isNaN(index) || !field) return;
    if (index >= settings.referenceLines.length) return;

    const line = settings.referenceLines[index];
    if (target.type === 'number' && (target.value === '' || isNaN(parseFloat(target.value)))) {
      target.value = line[field];
    }
  }

  init();
})();
