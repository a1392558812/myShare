/**
 * popup.js - 劈里啪啦屏蔽 管理面板逻辑
 *
 * 五种规则：title / user / selector / duration / classrule
 * 对应 config 中的 key：titleList / userName / className / durationRules / filterClassRules
 */

const TYPE_MAP = {
  title:     'titleList',
  user:      'userName',
  selector:  'className',
  duration:  'durationRules',
  classrule: 'filterClassRules'
};

let config = {
  titleList:        [],
  userName:         [],
  className:        [],
  durationRules:    [],
  filterClassRules: [],
  enabled:           true
};

const loadConfig = (cb) => {
  chrome.storage.sync.get(['titleList','userName','className','durationRules','filterClassRules','enabled'], (result) => {
    config.titleList        = result.titleList        || [];
    config.userName         = result.userName         || [];
    config.className        = result.className        || [];
    config.durationRules    = result.durationRules    || [];
    config.filterClassRules = result.filterClassRules || [];
    config.enabled          = result.enabled !== undefined ? result.enabled : true;
    if (cb) cb();
  });
}

const saveConfig = () => {
  chrome.storage.sync.set({
    titleList:        config.titleList,
    userName:         config.userName,
    className:        config.className,
    durationRules:    config.durationRules,
    filterClassRules: config.filterClassRules,
    enabled:          config.enabled
  });
}


const parseDurationInput = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  const parts = trimmed.split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
}

const formatDuration = (seconds) => {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  } else if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + String(s).padStart(2,'0');
  } else {
    return seconds + '秒';
  }
}

const checkDurationRuleConflict = (newRule, existingRules) => {
  for (const rule of existingRules) {
    if (newRule.type === 'between' && (rule.type === 'lt' || rule.type === 'gt')) {
      return '「区间规则」与「小于/大于规则」不能同时存在，请先删除已有规则';
    }
    if ((newRule.type === 'lt' || newRule.type === 'gt') && rule.type === 'between') {
      return '「小于/大于规则」与「区间规则」不能同时存在，请先删除已有规则';
    }
    if (newRule.type === 'lt' && rule.type === 'gt') {
      if (newRule.value >= rule.value) {
        return '「小于 ' + formatDuration(newRule.value) + '」与「大于 ' + formatDuration(rule.value) + '」冲突，请调整';
      }
    }
    if (newRule.type === 'gt' && rule.type === 'lt') {
      if (newRule.value <= rule.value) {
        return '「大于 ' + formatDuration(newRule.value) + '」与「小于 ' + formatDuration(rule.value) + '」冲突，请调整';
      }
    }
  }
  return null;
}

const getDurationRuleDesc = (rule) => {
  switch (rule.type) {
    case 'lt':      return '小于 ' + formatDuration(rule.value);
    case 'between': return formatDuration(rule.min) + ' ~ ' + formatDuration(rule.max);
    case 'gt':      return '大于 ' + formatDuration(rule.value);
    default: return '未知规则';
  }
}


const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const escapeHtml = (str) => {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

const renderList = (type) => {
  const idMap = {
    title:     { list: 'listTitle',     stat: 'statTitle' },
    user:      { list: 'listUser',      stat: 'statUser' },
    selector:  { list: 'listSelector',  stat: 'statSelector' },
    duration:  { list: 'listDuration',  stat: 'statDuration' },
    classrule: { list: 'listClassRule', stat: 'statClassRule' }
  };
  const ids = idMap[type];
  if (!ids) return;
  const listEl = document.getElementById(ids.list);
  const statEl = document.getElementById(ids.stat);
  if (!listEl) return;

  const cfgKey = TYPE_MAP[type];
  const arr = config[cfgKey];
  listEl.innerHTML = '';

  if (type === 'duration') {
    arr.forEach((rule, idx) => {
      const li = document.createElement('li');
      const desc = getDurationRuleDesc(rule);
      const typeClass = 'type-' + rule.type;
      const typeLabel = rule.type === 'lt' ? '小于' : rule.type === 'between' ? '区间' : '大于';
      li.innerHTML =
        '<span class="kw">' +
          '<span class="rule-type ' + typeClass + '">' + typeLabel + '</span>' +
          '<span>' + escapeHtml(desc) + '</span>' +
        '</span>' +
        '<button class="btn-del" data-type="' + type + '" data-idx="' + idx + '" title="删除">×</button>';
      listEl.appendChild(li);
    });
  } else if (type === 'classrule') {
    arr.forEach((rule, idx) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<span class="kw">' +
          '<span class="cr-selector">' + escapeHtml(rule.selector) + '</span>' +
          '<span>目标类：<span class="cr-target">' + escapeHtml(rule.targetClass) + '</span></span>' +
          '<span>祖先类：<span class="cr-ancestor">' + escapeHtml(rule.ancestorClass) + '</span></span>' +
        '</span>' +
        '<button class="btn-del" data-type="' + type + '" data-idx="' + idx + '" title="删除">×</button>';
      listEl.appendChild(li);
    });
  } else {
    arr.forEach((item, idx) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<span class="kw" title="' + escapeHtml(item) + '">' + escapeHtml(item) + '</span>' +
        '<button class="btn-del" data-type="' + type + '" data-idx="' + idx + '" title="删除">×</button>';
      listEl.appendChild(li);
    });
  }

  if (statEl) statEl.textContent = '已添加 ' + arr.length + ' 条';
}

const renderAll = () => {
  renderList('title');
  renderList('user');
  renderList('selector');
  renderList('duration');
  renderList('classrule');
  const el = document.getElementById('toggleEnabled');
  if (el) el.checked = config.enabled;
}


const addItem = (type, raw) => {
  const cfgKey = TYPE_MAP[type];
  const val = raw.trim();
  if (!val) return false;
  if (config[cfgKey].includes(val)) return false;
  config[cfgKey].push(val);
  saveConfig();
  renderList(type);
  return true;
}

const addDurationRule = () => {
  const type = document.getElementById('durationType').value;
  let newRule = null;

  if (type === 'lt') {
    const val = parseDurationInput(document.getElementById('durationLtValue').value);
    if (val === null || val <= 0) { alert('请输入有效的时长（如：5:00 或 300）'); return; }
    newRule = { type: 'lt', value: val };
  } else if (type === 'gt') {
    const val = parseDurationInput(document.getElementById('durationGtValue').value);
    if (val === null || val <= 0) { alert('请输入有效的时长（如：10:00 或 600）'); return; }
    newRule = { type: 'gt', value: val };
  } else if (type === 'between') {
    const min = parseDurationInput(document.getElementById('durationBetweenMin').value);
    const max = parseDurationInput(document.getElementById('durationBetweenMax').value);
    if (min === null || max === null || min <= 0 || max <= 0) { alert('请输入有效的时长范围（如：5:00 和 10:00）'); return; }
    if (min >= max) { alert('开始时长必须小于结束时长'); return; }
    newRule = { type: 'between', min: min, max: max };
  }

  if (!newRule) return;
  const conflict = checkDurationRuleConflict(newRule, config.durationRules);
  if (conflict) { alert('❌ ' + conflict); return; }

  config.durationRules.push(newRule);
  saveConfig();
  renderList('duration');

  document.getElementById('durationLtValue').value = '';
  document.getElementById('durationGtValue').value = '';
  document.getElementById('durationBetweenMin').value = '';
  document.getElementById('durationBetweenMax').value = '';
}

const addClassRule = () => {
  const selector    = document.getElementById('classRuleSelector').value.trim();
  const targetClass = document.getElementById('classRuleTarget').value.trim();
  const ancestorClass = document.getElementById('classRuleAncestor').value.trim();

  if (!selector)    { alert('请输入复合选择器'); return; }
  if (!targetClass)  { alert('请输入目标类名（class1）'); return; }
  if (!ancestorClass) { alert('请输入祖先类名（class2）'); return; }

  const exists = config.filterClassRules.some(r =>
    r.selector === selector && r.targetClass === targetClass && r.ancestorClass === ancestorClass
  );
  if (exists) { alert('该规则已存在'); return; }

  config.filterClassRules.push({
    selector: selector,
    targetClass: targetClass,
    ancestorClass: ancestorClass
  });
  saveConfig();
  renderList('classrule');

  document.getElementById('classRuleSelector').value = '';
  document.getElementById('classRuleTarget').value = '';
  document.getElementById('classRuleAncestor').value = '';
}

const removeItem = (type, idx) => {
  const cfgKey = TYPE_MAP[type];
  config[cfgKey].splice(idx, 1);
  saveConfig();
  renderList(type);
}

const clearItems = (type) => {
  if (!confirm('确定清空全部？')) return;
  const cfgKey = TYPE_MAP[type];
  config[cfgKey] = [];
  saveConfig();
  renderList(type);
}


const exportConfig = () => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    titleList:        config.titleList,
    userName:         config.userName,
    className:        config.className,
    durationRules:    config.durationRules,
    filterClassRules: config.filterClassRules,
    enabled:           config.enabled
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'plpl-block-config.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('✅ 配置已导出为 plpl-block-config.json');
}

const importConfig = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') throw new Error('无效的文件格式');
      if (!Array.isArray(data.titleList) || !Array.isArray(data.userName) || !Array.isArray(data.className)) {
        throw new Error('文件缺少必要的规则字段');
      }
      const mode = confirm(
        '导入模式：\n\n点击「确定」→ 合并模式（保留原有规则，追加新规则）\n点击「取消」→ 覆盖模式（清空原有规则，完全替换）'
      );
      if (mode) {
        config.titleList        = mergeUnique(config.titleList,        data.titleList);
        config.userName         = mergeUnique(config.userName,         data.userName);
        config.className        = mergeUnique(config.className,        data.className);
        if (Array.isArray(data.durationRules)) {
          config.durationRules = mergeDurationRules(config.durationRules, data.durationRules);
        }
        if (Array.isArray(data.filterClassRules)) {
          config.filterClassRules = mergeClassRules(config.filterClassRules, data.filterClassRules);
        }
      } else {
        config.titleList        = data.titleList;
        config.userName         = data.userName;
        config.className        = data.className;
        config.durationRules    = Array.isArray(data.durationRules) ? data.durationRules : [];
        config.filterClassRules = Array.isArray(data.filterClassRules) ? data.filterClassRules : [];
      }
      if (typeof data.enabled === 'boolean') {
        config.enabled = data.enabled;
      }
      saveConfig();
      renderAll();
      const total = config.titleList.length + config.userName.length + config.className.length + config.durationRules.length + config.filterClassRules.length;
      alert('✅ 导入成功！当前共 ' + total + ' 条规则');
    } catch (err) {
      alert('❌ 导入失败：' + err.message);
    }
  };
  reader.readAsText(file);
}

const mergeClassRules = (oldRules, newRules) => {
  const seen = new Set(oldRules.map(r => JSON.stringify(r)));
  const result = oldRules.slice();
  (newRules || []).forEach(rule => {
    const key = JSON.stringify(rule);
    if (!seen.has(key)) { seen.add(key); result.push(rule); }
  });
  return result;
}

const mergeDurationRules = (oldRules, newRules) => {
  const seen = new Set(oldRules.map(r => JSON.stringify(r)));
  const result = oldRules.slice();
  (newRules || []).forEach(rule => {
    const key = JSON.stringify(rule);
    if (!seen.has(key)) { seen.add(key); result.push(rule); }
  });
  return result;
}

const mergeUnique = (oldArr, newArr) => {
  const set = new Set(oldArr);
  (newArr || []).forEach(item => { if (item) set.add(item); });
  return Array.from(set);
}


const initTabs = () => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}


const initDurationForm = () => {
  const typeSelect = document.getElementById('durationType');
  if (!typeSelect) return;

  typeSelect.addEventListener('change', () => {
    const type = typeSelect.value;
    document.getElementById('durationLtRow').style.display     = type === 'lt'      ? 'flex' : 'none';
    document.getElementById('durationBetweenRow').style.display = type === 'between' ? 'flex' : 'none';
    document.getElementById('durationGtRow').style.display     = type === 'gt'      ? 'flex' : 'none';
  });

  const btnAdd = document.getElementById('btnAddDuration');
  if (btnAdd) btnAdd.addEventListener('click', addDurationRule);
}


const initClassRuleForm = () => {
  const btnAdd = document.getElementById('btnAddClassRule');
  if (btnAdd) btnAdd.addEventListener('click', addClassRule);
}


const bindEvents = () => {
  const tog = document.getElementById('toggleEnabled');
  if (tog) {
    tog.addEventListener('change', (e) => { config.enabled = e.target.checked; saveConfig(); });
  }

  [
    { type: 'title',    inputId: 'inputTitle',   btnId: 'btnAddTitle'   },
    { type: 'user',     inputId: 'inputUser',    btnId: 'btnAddUser'    },
    { type: 'selector', inputId: 'inputSelector', btnId: 'btnAddSelector' }
  ].forEach(({ type, inputId, btnId }) => {
    const input = document.getElementById(inputId);
    const btn   = document.getElementById(btnId);
    if (!input || !btn) return;
    btn.addEventListener('click', () => { if (addItem(type, input.value)) input.value = ''; input.focus(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { if (addItem(type, input.value)) input.value = ''; } });
  });

  document.querySelectorAll('.list').forEach(list => {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del');
      if (!btn) return;
      removeItem(btn.dataset.type, parseInt(btn.dataset.idx, 10));
    });
  });

  const clearMap = {
    title:     'btnClearTitle',
    user:      'btnClearUser',
    selector:  'btnClearSelector',
    duration:  'btnClearDuration',
    classrule: 'btnClearClassRule'
  };
  Object.entries(clearMap).forEach(([type, btnId]) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => clearItems(type));
  });

  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const fileImport = document.getElementById('fileImport');
  if (btnExport) btnExport.addEventListener('click', exportConfig);
  if (btnImport && fileImport) {
    btnImport.addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', (e) => {
      const file = e.target.files[0]; if (file) importConfig(file);
      e.target.value = '';
    });
  }

  initDurationForm();
  initClassRuleForm();
}


const init = () => {
  loadConfig(() => { renderAll(); initTabs(); bindEvents(); });
}

document.addEventListener('DOMContentLoaded', init);
