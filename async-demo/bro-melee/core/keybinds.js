/**
 * 技能键位自定义（v1.10）
 * 纯 localStorage 读写，供游戏内（useBroMelee）与开局前主界面（index.vue）共用
 * 结构：{ [skillId]: KeyboardEvent.code }，未记录的秘籍用默认槽位 1-9
 */

const STORAGE_KEY = 'bro-melee-keybinds';

/** 读取自定义键位表（损坏或不可用时回退空表） */
export const readKeybinds = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

/** 写回自定义键位表 */
export const writeKeybinds = (mapping) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
  } catch (error) {
    // 隐私模式等存不了就算了，本次会话仍然生效
  }
};

/** 绑定一个键（冲突的旧技能让回默认位），返回新的映射 */
export const bindKey = (mapping, skillId, code) => {
  const next = { ...mapping };
  Object.keys(next).forEach((existingId) => {
    if (existingId !== skillId && next[existingId] === code) {
      delete next[existingId];
    }
  });
  next[skillId] = code;
  writeKeybinds(next);
  return next;
};

/** 清除单个绑定 */
export const unbindKey = (mapping, skillId) => {
  const next = { ...mapping };
  delete next[skillId];
  writeKeybinds(next);
  return next;
};

/** 清空全部自定义 */
export const clearKeybinds = () => {
  writeKeybinds({});
  return {};
};

/** code -> skillId 反查表 */
export const keybindsByCode = (mapping) => {
  const result = {};
  Object.keys(mapping).forEach((skillId) => {
    result[mapping[skillId]] = skillId;
  });
  return result;
};

/** 槽位显示文本：Digit1 -> 1、KeyQ -> Q */
export const keybindCodeLabel = (code) => {
  if (!code) {
    return '';
  }
  if (code.startsWith('Digit') || code.startsWith('Numpad')) {
    return code.slice(-1);
  }
  return code.replace('Key', '');
};
