/**
 * Vue 与引擎的桥接层：只把低频 HUD 数据放进响应式，高频战斗状态留在引擎内
 */

import { computed, ref, shallowRef } from 'vue';
import { BroMeleeWorld } from '../core/world.js';
import { bindKey, clearKeybinds, keybindCodeLabel, keybindsByCode as keybindsByCodeMap, readKeybinds, unbindKey } from '../core/keybinds.js';

/** 初始 HUD 快照（避免模板访问 undefined） */
const createEmptyHud = () => {
  return {
    level: 1,
    hp: 120,
    maxHp: 120,
    hpRatio: 1,
    exp: 0,
    expNeed: 100,
    expRatio: 0,
    attack: 18,
    defense: 2,
    speed: 212,
    critRate: 6,
    shield: 0,
    kills: 0,
    time: 0,
    enemyCount: 0,
    spawn: null,
    activeSkills: [],
    passives: [],
    dashRatio: 1,
    dashReady: true,
    boss: null,
    autoCast: false,
    relics: [],
    relicHunted: false,
    buffs: [],
    treasures: [],
    companions: [],
    channel: null,
  };
};

export const useBroMelee = () => {
  const hud = ref(createEmptyHud());
  const skillChoices = ref(null);
  const notices = ref([]);
  const gameOver = ref(null);
  const status = ref('playing');
  const paused = ref(false);
  const encounter = ref(null);
  const encounterResult = ref(null);
  const world = shallowRef(null);
  let noticeId = 0;

  /** 推送一条飘出的提示，2.8 秒后自动消失 */
  const pushNotice = (notice) => {
    noticeId += 1;
    const entry = { id: noticeId, text: notice.text, color: notice.color };
    notices.value = [...notices.value.slice(-3), entry];
    window.setTimeout(() => {
      notices.value = notices.value.filter((item) => {
        return item.id !== entry.id;
      });
    }, 2800);
  };

  const createWorld = () => {
    return new BroMeleeWorld({
      onHud: (snapshot) => {
        hud.value = snapshot;
      },
      onSkillChoices: (choices) => {
        skillChoices.value = choices && choices.length ? choices : null;
        paused.value = Boolean(skillChoices.value);
      },
      onGameOver: (result) => {
        status.value = 'dead';
        gameOver.value = result;
      },
      onNotice: pushNotice,
      onEncounter: (payload) => {
        encounter.value = payload;
        if (payload) {
          encounterResult.value = null;
        }
      },
      onEncounterResult: (payload) => {
        encounterResult.value = payload;
      },
    });
  };

  if (!world.value) {
    world.value = createWorld();
  }

  // 调试/自动化测试句柄（配合 ` 键的调试面板使用）
  if (typeof window !== 'undefined') {
    window.__broMelee = world.value;
  }

  /** 开一局（保留当前视口尺寸） */
  const start = () => {
    status.value = 'playing';
    gameOver.value = null;
    skillChoices.value = null;
    encounter.value = null;
    encounterResult.value = null;
    paused.value = false;
    notices.value = [];
    world.value.reset();
  };

  const setViewSize = (width, height) => {
    world.value.setViewSize(width, height);
  };

  /** 开局前选模式：normal / nightmare（噩梦开启动态压力，可选难度 1~NIGHTMARE_MAX_LEVEL） */
  const setMode = (mode, level = 1) => {
    world.value.setMode(mode, level);
  };

  const update = (deltaTime) => {
    world.value.update(deltaTime);
  };

  const setMoveInput = (axisX, axisY) => {
    world.value.setMoveInput(axisX, axisY);
  };

  const setAim = (worldX, worldY) => {
    world.value.setAim(worldX, worldY);
  };

  const setAttackHeld = (held) => {
    world.value.setAttackHeld(held);
  };

  const dash = () => {
    world.value.requestDash();
  };

  const useSkill = (skillId) => {
    world.value.castSkill(skillId);
  };

  const chooseSkill = (skillId) => {
    world.value.chooseSkill(skillId);
  };

  const useRelic = (relicId) => {
    world.value.castRelic(relicId);
  };

  const dropRelic = (relicId) => {
    world.value.dropRelic(relicId);
  };

  const chooseEncounter = (choiceId) => {
    world.value.resolveEncounterChoice(choiceId);
  };

  const closeEncounterResult = () => {
    world.value.dismissEncounterResult();
  };

  const discardTreasure = (treasureId) => {
    world.value.dropTreasure(treasureId);
  };

  /** 切换自动技能（开启后自动释放伤害类秘籍） */
  const toggleAutoCast = () => {
    world.value.setAutoCast(!world.value.autoCast);
  };

  /** 循环切换普攻模式（自动 / 近战 / 远程） */
  const cycleAttackMode = () => {
    world.value.cycleAttackMode();
  };

  /** 施救倒地同伴（再按一次中止） */
  const startRevive = () => {
    world.value.startRevive();
  };

  /** 传功开关（按住持续回血，松开收功） */
  const startTransfer = () => {
    world.value.startTransfer();
  };

  /* ---------------------------------------------------------------- */
  /* 技能键位自定义（localStorage 跨局保留）                             */
  /* ---------------------------------------------------------------- */

  /** skillId -> KeyboardEvent.code 的自定义映射（空对象 = 全部用默认 1-9） */
  const keybinds = ref(readKeybinds());

  /** 给某本秘籍绑一个按键（冲突的旧绑定让回默认位） */
  const setKeybind = (skillId, code) => {
    keybinds.value = bindKey(keybinds.value, skillId, code);
  };

  /** 清掉某本秘籍的自定义键（回到默认 1-9） */
  const clearKeybind = (skillId) => {
    keybinds.value = unbindKey(keybinds.value, skillId);
  };

  /** 恢复全部默认 */
  const resetKeybinds = () => {
    keybinds.value = clearKeybinds();
  };

  /** code -> skillId 的反查表（keydown 用 O(1) 找到该放的招） */
  const keybindByCode = computed(() => {
    return keybindsByCodeMap(keybinds.value);
  });

  /** 槽位显示文本：自定义键显示键名，否则显示默认 1-9 */
  const keybindLabelOf = (skillId, fallbackSlot) => {
    const code = keybinds.value[skillId];
    return code ? keybindCodeLabel(code) : fallbackSlot;
  };

  return {
    hud,
    skillChoices,
    notices,
    gameOver,
    status,
    paused,
    encounter,
    encounterResult,
    world,
    start,
    setViewSize,
    setMode,
    update,
    setMoveInput,
    setAim,
    setAttackHeld,
    dash,
    useSkill,
    chooseSkill,
    useRelic,
    dropRelic,
    chooseEncounter,
    closeEncounterResult,
    discardTreasure,
    toggleAutoCast,
    cycleAttackMode,
    startRevive,
    startTransfer,
    keybinds,
    keybindByCode,
    setKeybind,
    clearKeybind,
    resetKeybinds,
    keybindLabelOf,
  };
};
