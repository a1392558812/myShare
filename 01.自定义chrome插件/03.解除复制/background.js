/**
 * background.js - Service Worker
 * 职责：
 * 1. 插件安装时初始化默认配置
 * 2. 接收 content script 的激活通知，更新插件图标 badge
 */

'use strict';

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ domains: [], enabled: true });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UNBLOCK_ACTIVATED') {
    if (sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({ tabId: sender.tab.id, text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#52c41a' });
    }
    sendResponse({ ok: true });
  }
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    try {
      chrome.action.setBadgeText({ tabId, text: '' });
    } catch (e) { }
  }
});
