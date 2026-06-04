import { UI_CONFIG } from "./constants.js";

// 格式化属性值显示（使用常量配置的小数位数）
export const formatStat = (value) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(UI_CONFIG.DECIMAL_PLACES);
};
