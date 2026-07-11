import { ref, watch } from "vue";

const STORAGE_KEY = "roguelike_auto_skills";

const cache = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
})();

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
  }
};

export const createAutoSkillRef = (key, defaultValue = false) => {
  const r = ref(cache[key] ?? defaultValue);
  watch(r, (val) => {
    cache[key] = val;
    save();
  });
  return r;
};
