/**
 * background.js - 劈里啪啦屏蔽 后台脚本
 * 安装时初始化默认配置
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.sync.set({
      titleList:        [],
      userName:         [],
      className:        [],
      durationRules:    [],
      filterClassRules: [],
      enabled:           true
    }, () => {
      console.log('[劈里啪啦] 默认配置已初始化');
    });
  }
});
