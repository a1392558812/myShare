/**
 * popup.js - 弹窗交互逻辑
 * 功能：显示当前域名、添加/删除域名、域名独立开关、导入/导出配置、总开关
 * 数据结构：domains = [{ domain: string, enabled: boolean }, ...]
 */

(() => {
  'use strict';

  const $enabledToggle = document.getElementById('enabledToggle');
  const $currentDomain = document.getElementById('currentDomain');
  const $addDomainBtn = document.getElementById('addDomainBtn');
  const $statusDot = document.getElementById('statusDot');
  const $statusText = document.getElementById('statusText');
  const $domainList = document.getElementById('domainList');
  const $domainCount = document.getElementById('domainCount');
  const $exportBtn = document.getElementById('exportBtn');
  const $importBtn = document.getElementById('importBtn');
  const $importFile = document.getElementById('importFile');
  const $domainInput = document.getElementById('domainInput');
  const $addDomainInputBtn = document.getElementById('addDomainInputBtn');
  const $toast = document.getElementById('toast');

  let currentDomain = '';
  let domains = [];
  let enabled = true;

  let toastTimer = null;
  const showToast = msg => {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove('show'), 2000);
  };

  const isDomainMatched = (domain, domainObjs) => {
    if (!domain || !domainObjs || domainObjs.length === 0) return false;
    domain = domain.toLowerCase();
    return domainObjs.some(item => {
      if (!item.enabled) return false;
      const pattern = item.domain.trim().toLowerCase();
      if (pattern === domain) return true;
      if (pattern.startsWith('*.')) {
        const base = pattern.slice(2);
        return domain === base || domain.endsWith('.' + base);
      }
      if (pattern.startsWith('*')) {
        return domain.endsWith(pattern.slice(1));
      }
      return false;
    });
  };

  const escapeHtml = str => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const saveDomains = () => {
    chrome.storage.local.set({ domains });
  };

  const updateStatus = () => {
    if (!enabled) {
      $statusDot.className = 'status-dot disabled';
      $statusText.textContent = '插件已禁用';
      return;
    }
    if (currentDomain && isDomainMatched(currentDomain, domains)) {
      $statusDot.className = 'status-dot active';
      $statusText.textContent = '已解除限制';
    } else {
      $statusDot.className = 'status-dot inactive';
      $statusText.textContent = currentDomain ? '当前域名未配置' : '无法获取域名';
    }
  };

  const renderDomainList = () => {
    $domainCount.textContent = domains.length;
    $exportBtn.disabled = domains.length === 0;

    if (domains.length === 0) {
      $domainList.innerHTML = '<div class="empty-state">暂无配置域名</div>';
      return;
    }

    $domainList.innerHTML = domains.map((item, index) => {
      const checked = item.enabled ? ' checked' : '';
      return `
        <div class="domain-item">
          <span class="domain-name" title="${escapeHtml(item.domain)}">${escapeHtml(item.domain)}</span>
          <div class="domain-controls">
            <label class="mini-switch" title="${item.enabled ? '已启用' : '已禁用'}">
              <input type="checkbox" class="domain-toggle" data-index="${index}"${checked}>
              <span class="mini-slider"></span>
            </label>
            <button class="delete-btn" data-index="${index}" title="删除">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>`;
    }).join('');

    $domainList.querySelectorAll('.domain-toggle').forEach(tog => {
      tog.addEventListener('change', e => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        const item = domains[idx];
        item.enabled = e.currentTarget.checked;
        saveDomains();
        updateStatus();
      });
    });

    $domainList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        const removed = domains.splice(idx, 1)[0];
        saveDomains();
        renderDomainList();
        updateStatus();
        showToast('已删除: ' + removed.domain);
      });
    });
  };

  const addDomain = domain => {
    domain = domain.trim().toLowerCase();
    if (!domain) {
      showToast('域名不能为空');
      return false;
    }
    if (!/^(\*\.)?[\w.-]+$/.test(domain)) {
      showToast('域名格式不正确');
      return false;
    }
    if (domains.some(item => item.domain === domain)) {
      showToast('域名已存在');
      return false;
    }
    domains.push({ domain, enabled: true });
    saveDomains();
    renderDomainList();
    updateStatus();
    showToast('已添加: ' + domain);
    return true;
  };

  const exportConfig = () => {
    const config = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      domains,
      enabled
    };
    const blob = new Blob([JSON.stringify(config)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unblock-copy-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('配置已导出');
  };

  const importConfig = file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result);
        const importedDomains = config.domains;
        if (!importedDomains || !Array.isArray(importedDomains)) {
          showToast('配置文件格式错误');
          return;
        }

        const normalized = importedDomains
          .map(item => ({
            domain: (item.domain || '').trim().toLowerCase(),
            enabled: item.enabled !== false
          }))
          .filter(item => item.domain);

        const seen = {};
        const newDomains = [];
        domains.concat(normalized).forEach(item => {
          if (!seen[item.domain]) {
            seen[item.domain] = true;
            newDomains.push(item);
          }
        });
        domains = newDomains;
        if (typeof config.enabled === 'boolean') {
          enabled = config.enabled;
          $enabledToggle.checked = enabled;
        }
        chrome.storage.local.set({ domains, enabled });
        renderDomainList();
        updateStatus();
        showToast('导入成功');
      } catch (err) {
        showToast('解析失败: ' + err.message);
      }
    };
    reader.onerror = () => showToast('文件读取失败');
    reader.readAsText(file);
  };

  const getCurrentTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs && tabs[0]) {
        if (tabs[0].url) {
          try {
            const url = new URL(tabs[0].url);
            currentDomain = url.hostname;
            $currentDomain.textContent = currentDomain;
            if (isDomainMatched(currentDomain, domains)) {
              $addDomainBtn.textContent = '已添加';
              $addDomainBtn.disabled = true;
            } else {
              $addDomainBtn.textContent = '添加';
              $addDomainBtn.disabled = false;
            }
          } catch (e) {
            $currentDomain.textContent = '无法解析';
          }
        } else {
          $currentDomain.textContent = '无法获取';
        }
      } else {
        $currentDomain.textContent = '无法获取';
      }
      updateStatus();
    });
  };

  const init = () => {
    chrome.storage.local.get(['domains', 'enabled'], data => {
      domains = data.domains || [];
      enabled = data.enabled !== false;
      $enabledToggle.checked = enabled;
      renderDomainList();
      getCurrentTab();
    });
  };


  $addDomainBtn.addEventListener('click', () => {
    if (currentDomain && addDomain(currentDomain)) {
      $addDomainBtn.textContent = '已添加';
      $addDomainBtn.disabled = true;
    }
  });

  $addDomainInputBtn.addEventListener('click', () => {
    if (addDomain($domainInput.value)) {
      $domainInput.value = '';
    }
  });
  $domainInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && addDomain($domainInput.value)) {
      $domainInput.value = '';
    }
  });

  $enabledToggle.addEventListener('change', e => {
    enabled = e.currentTarget.checked;
    chrome.storage.local.set({ enabled });
    updateStatus();
    showToast(enabled ? '已启用' : '已禁用');
  });

  $exportBtn.addEventListener('click', exportConfig);

  $importBtn.addEventListener('click', () => $importFile.click());
  $importFile.addEventListener('change', e => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      importConfig(e.currentTarget.files[0]);
      e.currentTarget.value = '';
    }
  });

  init();
})();
