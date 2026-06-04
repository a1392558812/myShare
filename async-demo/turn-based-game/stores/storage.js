const STORAGE_KEY = "turn_based_game_save";

export const loadSave = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("加载存档失败", e);
  }
  return null;
};

export const saveGame = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("保存游戏失败", e);
  }
};
