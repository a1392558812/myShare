/**
 * content.js - 解除复制/选中限制的核心脚本
 * 运行于 document_start，在页面脚本之前接管事件流
 *
 * 策略：
 * 1. 捕获阶段（capture phase）在 window/document 上拦截所有复制/选中限制事件，
 *    调用 stopImmediatePropagation() 阻止页面监听器执行，同时不阻止默认行为
 * 2. 注入 CSS 覆盖 user-select: none 等样式
 * 3. 遍历 DOM 移除内联事件处理器（oncopy, oncontextmenu 等）
 * 4. MutationObserver 监听新增节点，即时清除限制
 * 5. 定时器循环清理，应对页面脚本反复绑定的情况
 */

(() => {
  'use strict';

  const BLOCK_EVENTS = [
    'copy', 'cut', 'paste',
    'contextmenu', 'selectstart', 'dragstart',
    'beforecopy', 'beforecut', 'beforepaste',
    'select', 'selectionchange'
  ];

  const INLINE_HANDLERS = [
    'oncopy', 'oncut', 'onpaste',
    'oncontextmenu', 'onselectstart', 'ondragstart',
    'onmousedown', 'onmouseup', 'onkeydown', 'onkeypress', 'onkeyup',
    'onbeforecopy', 'onbeforecut', 'onbeforepaste'
  ];

  const OVERRIDE_CSS = [
    '*, *::before, *::after {',
    '  -webkit-user-select: text !important;',
    '  -moz-user-select: text !important;',
    '  -ms-user-select: text !important;',
    '  user-select: text !important;',
    '  -webkit-touch-callout: default !important;',
    '  -webkit-user-drag: auto !important;',
    '}',
    '::selection {',
    '  background-color: #3297fd !important;',
    '  color: #fff !important;',
    '}',
    'input, textarea {',
    '  -webkit-user-select: text !important;',
    '  user-select: text !important;',
    '}'
  ].join('\n');

  /**
   * 域名匹配：支持通配符 *.example.com，仅匹配 enabled 条目
   * @param {string} domain - 当前域名
   * @param {Array<{domain:string, enabled:boolean}>} domainObjs - 域名配置数组
   */
  const isDomainMatched = (domain, domainObjs) => {
    if (!domain || !domainObjs || domainObjs.length === 0) return false;
    domain = domain.toLowerCase();
    return domainObjs.some(item => {
      if (!item.enabled) return false;
      const pattern = (item.domain || '').trim().toLowerCase();
      if (!pattern) return false;
      if (pattern === domain) return true;
      if (pattern.startsWith('*.')) {
        const base = pattern.slice(2);
        return domain === base || domain.endsWith('.' + base);
      }
      if (pattern.startsWith('*')) {
        const suffix = pattern.slice(1);
        return domain.endsWith(suffix);
      }
      return false;
    });
  };

  const cleanElement = el => {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    for (const name of INLINE_HANDLERS) {
      try {
        if (el[name]) el[name] = null;
      } catch (e) { }
    }
    try {
      if (el.getAttribute && el.getAttribute('unselectable')) {
        el.removeAttribute('unselectable');
      }
    } catch (e) { }
    try {
      const attrs = el.attributes;
      if (attrs) {
        for (let j = attrs.length - 1; j >= 0; j--) {
          const attr = attrs[j];
          if (INLINE_HANDLERS.includes(attr.name.toLowerCase())) {
            el.removeAttributeNode(attr);
          }
        }
      }
    } catch (e) { }
  };

  const cleanAll = () => {
    try {
      INLINE_HANDLERS.forEach(name => {
        try { if (document[name]) document[name] = null; } catch (e) { }
      });
      if (document.body) {
        INLINE_HANDLERS.forEach(name => {
          try { if (document.body[name]) document.body[name] = null; } catch (e) { }
        });
        ['oncontextmenu', 'onselectstart', 'oncopy', 'ondragstart', 'onmousedown'].forEach(attr => {
          if (document.body.hasAttribute && document.body.hasAttribute(attr)) {
            document.body.removeAttribute(attr);
          }
        });
      }
      if (document.documentElement) {
        INLINE_HANDLERS.forEach(name => {
          try { if (document.documentElement[name]) document.documentElement[name] = null; } catch (e) { }
        });
      }
      document.querySelectorAll('*').forEach(el => cleanElement(el));
    } catch (e) {
    }
  };

  const injectCSS = () => {
    if (document.getElementById('__unblock_copy_style__')) return;
    const style = document.createElement('style');
    style.id = '__unblock_copy_style__';
    style.textContent = OVERRIDE_CSS;
    (document.head || document.documentElement).appendChild(style);
  };

  const activate = () => {
    BLOCK_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
      document.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
    });

    window.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey) {
        const key = (e.key || '').toLowerCase();
        if (key === 'c' || key === 'x' || key === 'a' || key === 's') {
          e.stopImmediatePropagation();
        }
      }
    }, true);

    injectCSS();

    cleanAll();

    const onDOMReady = () => {
      injectCSS();
      cleanAll();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDOMReady, true);
    } else {
      onDOMReady();
    }

    window.addEventListener('load', () => {
      injectCSS();
      cleanAll();
    }, true);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              cleanElement(node);
              if (node.querySelectorAll) {
                node.querySelectorAll('*').forEach(child => cleanElement(child));
              }
            }
          });
        }
        if (mutation.type === 'attributes') {
          cleanElement(mutation.target);
        }
      });
    });

    const startObserver = () => {
      observer.observe(document.documentElement || document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: INLINE_HANDLERS.concat(['unselectable', 'style'])
      });
    };
    startObserver();

    let cleanupCount = 0;
    const maxCleanups = 150;
    const cleanupTimer = setInterval(() => {
      injectCSS();
      INLINE_HANDLERS.forEach(name => {
        try { if (document[name]) document[name] = null; } catch (e) { }
        if (document.body) {
          try { if (document.body[name]) document.body[name] = null; } catch (e) { }
        }
        if (document.documentElement) {
          try { if (document.documentElement[name]) document.documentElement[name] = null; } catch (e) { }
        }
      });
      cleanupCount++;
      if (cleanupCount >= maxCleanups) {
        clearInterval(cleanupTimer);
      }
    }, 2000);

    try {
      chrome.runtime.sendMessage({ type: 'UNBLOCK_ACTIVATED', domain: location.hostname });
    } catch (e) { }
  };

  const init = () => {
    try {
      chrome.storage.local.get(['domains', 'enabled'], data => {
        const domains = data.domains || [];
        const enabled = data.enabled !== false;
        if (!enabled || domains.length === 0) return;

        const currentDomain = location.hostname;
        if (!currentDomain) return;

        if (isDomainMatched(currentDomain, domains)) {
          activate();
        }
      });
    } catch (e) {
    }
  };

  init();
})();
