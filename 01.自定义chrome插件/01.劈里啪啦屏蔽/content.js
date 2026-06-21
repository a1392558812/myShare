/**
 * 劈里啪啦屏蔽 - B站首页内容过滤器
 *
 * 功能1 (titleList): 标题含关键词 → 隐藏 .feed-card
 * 功能2 (userName):  UP主含关键词 → 隐藏 .feed-card
 * 功能3 (className): 自定义 CSS 选择器 → 直接隐藏匹配元素
 * 功能4 (durationRules): 视频时长过滤 → 隐藏 .feed-card
 * 功能5 (filterClassRules): 条件祖先隐藏 → 匹配元素含目标类名时，隐藏最近拥有祖先类名的祖先元素
 */

let config = {
  titleList: [],
  userName: [],
  className: [],
  durationRules: [],
  filterClassRules: [],
  enabled: true
};

const loadConfig = (cb) => {
  chrome.storage.sync.get(['titleList', 'userName', 'className', 'durationRules', 'filterClassRules', 'enabled'], (result) => {
    config.titleList        = result.titleList        || [];
    config.userName         = result.userName         || [];
    config.className        = result.className        || [];
    config.durationRules    = result.durationRules    || [];
    config.filterClassRules = result.filterClassRules || [];
    config.enabled          = result.enabled !== undefined ? result.enabled : true;
    cb && cb();
  });
}

const hideCardsByText = (selectors, keywordList) => {
  let count = 0;
  const elements = document.querySelectorAll(selectors.join(','));

  elements.forEach(el => {
    const card = el.closest('.feed-card') || el.closest('.bili-feed-card');
    if (!card || card.hasAttribute('data-plpl-card')) return;

    const text = (el.textContent || el.getAttribute('title') || '').trim();
    const matched = keywordList.some(kw => kw && text.includes(kw));
    if (!matched) return;

    card.setAttribute('data-plpl-card', '1');
    card.style.display = 'none';
    count++;
  });

  return count;
}

const filterByTitle = () => {
  return hideCardsByText(
    [
      '.feed-card .bili-feed-card .bili-video-card__info a',
      '.bili-video-card__info a',
      '.bili-video-card a[title]',
      '.video-card__info a'
    ],
    config.titleList
  );
}

const filterByUser = () => {
  return hideCardsByText(
    [
      '.feed-card .bili-feed-card .bili-video-card__info--bottom a',
      '.bili-video-card__info--bottom a',
      '.up-name',
      '.video-card__info--bottom a'
    ],
    config.userName
  );
}

const filterByClassName = () => {
  let count = 0;
  config.className.forEach(selector => {
    if (!selector || typeof selector !== 'string') return;
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el.hasAttribute('data-plpl-cls')) return;
        el.setAttribute('data-plpl-cls', el.style.display || '');
        el.style.display = 'none';
        count++;
      });
    } catch (e) {
      console.warn('[劈里啪啦] 无效选择器:', selector, e);
    }
  });
  return count;
}


/**
 * 解析时长字符串为秒数
 * 支持格式：mm:ss 或 hh:mm:ss
 * @param {string} str - 时长字符串，如 "05:30" 或 "1:23:45"
 * @returns {number|null} - 秒数，解析失败返回 null
 */
const parseDuration = (str) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  const parts = trimmed.split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
}

/**
 * 检查视频时长是否匹配某条规则
 * @param {number} seconds - 视频时长（秒）
 * @param {object} rule - 规则对象
 * @returns {boolean}
 */
const matchDurationRule = (seconds, rule) => {
  if (!rule || typeof rule !== 'object') return false;
  switch (rule.type) {
    case 'lt':
      return seconds < rule.value;
    case 'between':
      return seconds >= rule.min && seconds <= rule.max;
    case 'gt':
      return seconds > rule.value;
    default:
      return false;
  }
}

const filterByDuration = () => {
  let count = 0;
  if (!config.durationRules || config.durationRules.length === 0) return 0;

  const selectors = [
    '.feed-card .bili-feed-card .bili-video-card__stats__duration',
    '.bili-video-card__stats__duration',
    '.video-card__stats__duration',
    '.duration'
  ];

  const elements = document.querySelectorAll(selectors.join(','));

  elements.forEach(el => {
    const card = el.closest('.feed-card') || el.closest('.bili-feed-card');
    if (!card || card.hasAttribute('data-plpl-duration')) return;

    const durationStr = (el.textContent || '').trim();
    const seconds = parseDuration(durationStr);
    if (seconds === null) return;

    const matched = config.durationRules.some(rule => matchDurationRule(seconds, rule));
    if (!matched) return;

    card.setAttribute('data-plpl-duration', '1');
    card.style.display = 'none';
    card.remove()
    count++;
  });

  return count;
}

const filterByClassRule = () => {
  let count = 0;
  console.log('[劈里啪啦] 功能5 开始执行')
  if (!config.filterClassRules || config.filterClassRules.length === 0) return 0;

  config.filterClassRules.forEach(rule => {
    if (!rule || !rule.selector || !rule.targetClass || !rule.ancestorClass) return;

    try {
      document.querySelectorAll(rule.selector).forEach(el => {
        if (!el.classList.contains(rule.targetClass.replace('.', ''))) return;
        const ancestor = el.closest(rule.ancestorClass);
        if (!ancestor) return;

        if (ancestor.hasAttribute('data-plpl-ancestor')) return;

        ancestor.setAttribute('data-plpl-ancestor', rule.selector + '||' + rule.targetClass + '||' + rule.ancestorClass);
        ancestor.setAttribute('data-plpl-ancestor-display', ancestor.style.display || '');
        ancestor.style.display = 'none';
        count++;
        console.log('[劈里啪啦] 功能5 隐藏元素:', ancestor, rule);
      });
    } catch (e) {
      console.warn('[劈里啪啦] 功能5 无效选择器:', rule.selector, e);
    }
  });

  return count;
}

const restoreAll = () => {
  document.querySelectorAll('[data-plpl-card]').forEach(card => {
    card.style.display = '';
    card.removeAttribute('data-plpl-card');
  });

  document.querySelectorAll('[data-plpl-cls]').forEach(el => {
    const orig = el.getAttribute('data-plpl-cls');
    el.style.display = orig;
    el.removeAttribute('data-plpl-cls');
  });

  document.querySelectorAll('[data-plpl-duration]').forEach(card => {
    card.style.display = '';
    card.removeAttribute('data-plpl-duration');
  });

  document.querySelectorAll('[data-plpl-ancestor]').forEach(el => {
    const orig = el.getAttribute('data-plpl-ancestor-display');
    el.style.display = orig;
    el.removeAttribute('data-plpl-ancestor');
    el.removeAttribute('data-plpl-ancestor-display');
  });
}

const runAllFilters = () => {
  if (!config.enabled) return;
  const c1 = filterByTitle();
  const c2 = filterByUser();
  const c3 = filterByClassName();
  const c4 = filterByDuration();
  const c5 = filterByClassRule();
  const total = (c1 || 0) + (c2 || 0) + (c3 || 0) + (c4 || 0) + (c5 || 0);
  if (total > 0) console.log(`[劈里啪啦] 屏蔽 ${total} 个元素`);
}

let observer = null;
const startObserver = () => {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => {
    clearTimeout(window.__plplTimer);
    window.__plplTimer = setTimeout(runAllFilters, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.onChanged.addListener(changes => {
  let needRestore = false;
  if (changes.titleList)        { config.titleList        = changes.titleList.newValue        || [];  needRestore = true; }
  if (changes.userName)         { config.userName         = changes.userName.newValue         || [];  needRestore = true; }
  if (changes.className)        { config.className        = changes.className.newValue        || [];  needRestore = true; }
  if (changes.durationRules)    { config.durationRules    = changes.durationRules.newValue    || [];  needRestore = true; }
  if (changes.filterClassRules) { config.filterClassRules = changes.filterClassRules.newValue || [];  needRestore = true; }
  if (changes.enabled)          { config.enabled          = changes.enabled.newValue;               needRestore = true; }

  if (needRestore) {
    restoreAll();
    if (config.enabled) runAllFilters();
  }
});

const init = () => {
  loadConfig(() => {
    if (config.enabled) runAllFilters();
    startObserver();
    console.log('[劈里啪啦屏蔽] 已启动', config);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
