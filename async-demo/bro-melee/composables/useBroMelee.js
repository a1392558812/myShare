/**
 * Vue 与引擎的桥接层：只把低频 HUD 数据放进响应式，高频战斗状态留在引擎内
 */

import { ref, shallowRef } from 'vue';
import { BroMeleeWorld } from '../core/world.js';

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
  };
};
