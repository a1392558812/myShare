<template>
  <div class="debug-panel" @contextmenu.stop>
    <div class="debug-head">
      <span class="debug-title">调试台</span>
      <span class="debug-hint">` 键开关</span>
      <button class="debug-close" @click="$emit('close')">×</button>
    </div>

    <div class="debug-tabs">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="debug-tab"
        :class="{ 'debug-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="world" class="debug-body">
      <!-- 秘籍 / 冷却 -->
      <template v-if="activeTab === 'skills'">
        <div class="debug-actions">
          <button class="debug-btn" @click="run('maxAllSkills')">全满级</button>
          <button class="debug-btn" @click="run('clearSkills')">全部遗忘</button>
          <button class="debug-btn" @click="run('setAllCooldowns', 0)">技能就绪</button>
        </div>
        <div v-for="group in skillGroups" :key="group.key" class="debug-group">
          <div class="group-title">{{ group.label }}</div>
          <div v-for="skill in group.skills" :key="skill.id" class="skill-row">
            <span class="dot" :style="{ background: skill.color }"></span>
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-stack" :class="{ 'skill-stack--off': !stackOf(skill.id) }">
              {{ stackOf(skill.id) }}/{{ skill.maxStack }}
            </span>
            <button
              v-if="skill.type === 'active'"
              class="cd-chip"
              :class="{ 'cd-chip--ready': cdOf(skill.id) <= 0 }"
              @click="run('setSkillCooldown', skill.id, 0)"
            >
              {{ cdText(skill.id) }}
            </button>
            <button class="mini" @click="run('addSkillStack', skill.id, -1)">−</button>
            <button class="mini" @click="run('addSkillStack', skill.id, 1)">+</button>
          </div>
        </div>
      </template>

      <!-- 境界 / 属性 / buff -->
      <template v-else-if="activeTab === 'status'">
        <div class="debug-section">
          <div class="section-title">境界与气血</div>
          <div class="field-row">
            <span class="field-label">等级</span>
            <input v-model.number="levelInput" class="field-input" type="number" min="1" max="99" />
            <button class="debug-btn" @click="run('setLevel', levelInput)">应用</button>
          </div>
          <div class="field-row">
            <span class="field-label">气血%</span>
            <input v-model.number="hpInput" class="field-input" type="number" min="1" max="100" />
            <button class="debug-btn" @click="run('setHpRatio', hpInput / 100)">应用</button>
            <button class="debug-btn" @click="run('healFull')">回满</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">基础属性（不含秘籍加成）</div>
          <div class="field-row">
            <span class="field-label">攻击</span>
            <input v-model.number="baseInputs.attack" class="field-input" type="number" min="1" />
            <span class="field-label">防御</span>
            <input v-model.number="baseInputs.defense" class="field-input" type="number" min="0" />
          </div>
          <div class="field-row">
            <span class="field-label">移速</span>
            <input v-model.number="baseInputs.speed" class="field-input" type="number" min="40" />
            <span class="field-label">气血</span>
            <input v-model.number="baseInputs.maxHp" class="field-input" type="number" min="20" />
          </div>
          <div class="field-row">
            <button class="debug-btn" @click="applyBaseStats">应用属性</button>
            <span class="field-note">当前 攻 {{ hud.attack }} · 防 {{ hud.defense }} · 速 {{ hud.speed }} · 血 {{ hud.maxHp }}</span>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">Buff / 负面状态</div>
          <div class="stat-line">
            <span class="stat-name">护盾</span>
            <span class="stat-value">{{ Math.round(hud.shield) }}</span>
            <button class="debug-btn" @click="run('applyShield', 200)">+200</button>
            <button class="debug-btn" @click="run('applyShield', 0)">清除</button>
          </div>
          <div class="stat-line">
            <span class="stat-name">无敌</span>
            <span class="stat-value">{{ seconds(world.player.invulnerableTimer) }}</span>
            <button class="debug-btn" @click="run('applyInvincible', 8)">8s</button>
            <button class="debug-btn" @click="run('applyInvincible', 0)">取消</button>
          </div>
          <div class="stat-line">
            <span class="stat-name">加速</span>
            <span class="stat-value">{{ buffText(world.player.speedBoostTimer, world.player.speedBoostMultiplier) }}</span>
            <button class="debug-btn" @click="run('applyHaste', 1.6, 8)">1.6× 8s</button>
            <button class="debug-btn" @click="run('applyHaste', 1, 0)">取消</button>
          </div>
          <div class="stat-line">
            <span class="stat-name">减速</span>
            <span class="stat-value">{{ buffText(world.player.slowTimer, world.player.slowMultiplier) }}</span>
            <button class="debug-btn" @click="run('applySlow', 0.5, 6)">0.5× 6s</button>
            <button class="debug-btn" @click="run('applySlow', 1, 0)">取消</button>
          </div>
          <div class="stat-line">
            <span class="stat-name">点穴</span>
            <span class="stat-value">{{ seconds(world.player.stunTimer) }}</span>
            <button class="debug-btn" @click="run('applyStun', 3)">3s</button>
            <button class="debug-btn" @click="run('clearBuffs')">清空全部</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">冷却</div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('setAllCooldowns', 0)">全部就绪</button>
            <button class="debug-btn" @click="run('setAllCooldowns', 15)">全部进 CD</button>
            <button class="debug-btn" @click="run('resetDash')">冲刺就绪</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">开关</div>
          <label class="debug-check">
            <input type="checkbox" :checked="world.debug.invincible" @change="toggleGod" />
            <span>上帝模式（免伤）</span>
          </label>
          <label class="debug-check">
            <input type="checkbox" :checked="hud.autoCast" @change="$emit('toggle-auto')" />
            <span>自动战斗（技能 + 普攻）</span>
          </label>
        </div>
      </template>

      <!-- 敌人 -->
      <template v-else-if="activeTab === 'enemies'">
        <div class="debug-section">
          <div class="section-title">刷怪（落在视野内）</div>
          <div class="field-row">
            <select v-model="spawnType" class="field-select">
              <option v-for="type in enemyTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>
          <div class="field-row">
            <span class="field-label">等级</span>
            <input v-model.number="spawnLevel" class="field-input" type="number" min="1" max="99" />
            <span class="field-label">数量</span>
            <input v-model.number="spawnCount" class="field-input" type="number" min="1" max="30" />
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="spawn()">刷出</button>
            <button class="debug-btn" @click="run('spawnBoss')">刷首领</button>
          </div>
          <div class="field-note">敌人等级越高，携带的武功越多（1 + 等级/5，上限 4 门）</div>
        </div>

        <div class="debug-section">
          <div class="section-title">场上 {{ hud.enemyCount }} 只</div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('adjustEnemyLevels', 3)">全体 +3 级</button>
            <button class="debug-btn" @click="run('adjustEnemyLevels', -3)">全体 -3 级</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('clearEnemies', true)">秒杀全场（给经验）</button>
            <button class="debug-btn" @click="run('clearEnemies', false)">清空</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">随机数</div>
          <div class="field-note">刷新等级区间、敌人携带武功都走 Math.random，多次「刷出」可观察不同组合。</div>
        </div>
      </template>

      <!-- 神兵 -->
      <template v-else-if="activeTab === 'relics'">
        <div class="debug-section">
          <div class="section-title">归属</div>
          <div v-for="relic in hud.relics" :key="relic.id" class="relic-row">
            <span class="dot" :style="{ background: relic.color }"></span>
            <span class="skill-name">{{ relic.name }}</span>
            <span class="relic-state" :class="{ 'relic-state--own': relic.owned }">
              {{ relic.owned ? '在手上' : '不在手上' }}
            </span>
            <button class="debug-btn" @click="run('grantRelic', relic.id)">给我</button>
            <button class="debug-btn" @click="run('dropRelic', relic.id)">弃掉</button>
            <button class="debug-btn" @click="run('spawnRelic', relic.id)">投放脚下</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">争夺</div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('spawnXieXun')">刷谢逊（携双兵）</button>
            <button class="debug-btn" @click="run('spawnRevengeXieXun')">刷复仇谢逊 + 张翠山</button>
            <button class="debug-btn" @click="run('spawnHunters')">刷猎杀队</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('unlockRelics')">神兵落江湖</button>
            <button class="debug-btn" @click="run('relicCooldownsZero')">绝学就绪</button>
          </div>
          <div class="field-note">
            非谢逊角色持兵即触发猎杀队；敌人会评估自身战力决定抢不抢、扛不住就丢。持兵玩家会被远程偷袭。
          </div>
        </div>
      </template>

      <!-- 奇遇 -->
      <template v-else-if="activeTab === 'encounters'">
        <div class="debug-section">
          <div class="section-title">指定奇遇</div>
          <div class="field-row">
            <select v-model="encounterPick" class="field-select">
              <option v-for="encounter in encounterOptions" :key="encounter.id" :value="encounter.id">
                {{ encounter.name }}
              </option>
            </select>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('spawnEncounter', encounterPick)">浮在脚边</button>
            <button class="debug-btn" @click="run('forceEncounter', encounterPick)">立刻弹出</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('spawnEncounter', null)">随机浮出</button>
            <button class="debug-btn" @click="resolveFirstChoice">直接结算首项</button>
          </div>
          <div class="field-note">走近地面光环会自动触发；触发后世界暂停，1/2/3 抉择、Esc 离开。</div>
        </div>

        <div class="debug-section">
          <div class="section-title">宝物（永久）</div>
          <div v-for="treasure in treasureList" :key="treasure.id" class="relic-row">
            <span class="dot" :style="{ background: treasure.color }"></span>
            <span class="skill-name">{{ treasure.name }}</span>
            <span class="relic-state" :class="{ 'relic-state--own': hasTreasure(treasure.id) }">
              {{ hasTreasure(treasure.id) ? '在身上' : '未持有' }}
            </span>
            <button class="debug-btn" @click="run('grantTreasure', treasure.id)">给我</button>
            <button class="debug-btn" @click="run('dropTreasure', treasure.id)">销毁</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">随从 / 打坐</div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('spawnCompanion', { typeId: 'juniorSister', guardFatal: false })">刷小师妹</button>
            <button class="debug-btn" @click="run('spawnCompanion', { typeId: 'woundedAlly', guardFatal: true })">刷守护随从</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('startTestChannel', 10)">打坐 10s</button>
            <button class="debug-btn" @click="run('startTestChannel', 3)">打坐 3s</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('grantCompanionManual', 1)">随从自修 1 本</button>
            <button class="debug-btn" @click="run('grantCompanionManual', 5)">随从自修 5 本</button>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('learnSkill', 'sunflower-manual')">练《葵花宝典》</button>
          </div>
          <div class="field-note">
            打坐期间无法移动，受击即散功；守护随从会替你挡一次致命伤害。小师妹入队后会自己挑秘籍练（火候六成），玩家练《葵花宝典》她会当场掩鼻下山。
          </div>
          <div v-for="mate in companionInfoList()" :key="mate.id" class="relic-row">
            <span class="dot" :style="{ background: '#ffd3ea' }"></span>
            <span class="skill-name">{{ mate.name }} · Lv.{{ mate.level }}</span>
            <span class="relic-state relic-state--own">{{ mate.manuals.length }} 本</span>
          </div>
          <div v-for="mate in companionInfoList()" :key="`m-${mate.id}`" class="field-note">
            {{ mate.name }}：{{ mate.manuals.length ? mate.manuals.map((entry) => `${entry.name}${entry.stack > 1 ? `×${entry.stack}` : ''}`).join('、') : '尚未领悟' }}
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">当前状态</div>
          <div class="stat-line">
            <span class="stat-name">buff</span>
            <span class="stat-value">{{ buffSummary }}</span>
          </div>
          <div class="stat-line">
            <span class="stat-name">宝物</span>
            <span class="stat-value">{{ treasureSummary }}</span>
          </div>
          <div class="stat-line">
            <span class="stat-name">随从</span>
            <span class="stat-value">{{ companionSummary }}</span>
          </div>
          <div class="stat-line">
            <span class="stat-name">打坐</span>
            <span class="stat-value">{{ hud.channel ? `${hud.channel.name} ${Math.round(hud.channel.ratio * 100)}%` : '无' }}</span>
          </div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('grantBuff', {})">给个测试 buff</button>
            <button class="debug-btn" @click="run('clearEncounters')">清空奇遇状态</button>
          </div>
        </div>

        <div class="debug-section">
          <div class="section-title">嘲讽气泡</div>
          <div class="debug-actions">
            <button class="debug-btn" @click="run('tauntNow')">让路人说一句</button>
            <button class="debug-btn" @click="run('learnSkill', 'sunflower-manual')">学《葵花宝典》</button>
            <button class="debug-btn" @click="run('learnSkill', 'toad-skill')">学《蛤蟆功》</button>
          </div>
          <div class="field-note">练了这两门功法后，附近敌人每隔 9~13 秒会冒个气泡嘲笑你（或只甩个表情）。</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { PLAYER_SKILLS, SKILL_CATEGORY_LABEL } from '../config/skills.js';
import { NORMAL_ENEMY_TYPES } from '../config/enemies.js';
import { ENCOUNTERS } from '../config/encounters.js';
import { TREASURES } from '../config/treasures.js';

const props = defineProps({
  world: {
    type: Object,
    default: null,
  },
  hud: {
    type: Object,
    required: true,
  },
});

defineEmits(['close', 'toggle-auto']);

const TABS = [
  { id: 'skills', label: '秘籍' },
  { id: 'status', label: '状态' },
  { id: 'enemies', label: '敌人' },
  { id: 'relics', label: '神兵' },
  { id: 'encounters', label: '奇遇' },
];

const activeTab = ref('skills');
const levelInput = ref(props.hud.level);
const hpInput = ref(100);
const baseInputs = ref({
  attack: 22,
  defense: 2,
  speed: 214,
  maxHp: 150,
});
const spawnType = ref('wolf');
const spawnLevel = ref(props.hud.level);
const spawnCount = ref(3);
const enemyTypes = NORMAL_ENEMY_TYPES;
const encounterPick = ref(ENCOUNTERS[0].id);
const encounterOptions = ENCOUNTERS;
const treasureList = Object.values(TREASURES);

const hasTreasure = (treasureId) => {
  return Boolean(props.world && props.world.player.treasures.includes(treasureId));
};

const resolveFirstChoice = () => {
  const config = ENCOUNTERS.find((entry) => entry.id === encounterPick.value);
  if (!config || !config.choices.length) {
    return;
  }
  run('resolveEncounterNow', config.id, config.choices[0].id);
};

const buffSummary = computed(() => {
  if (!props.hud.buffs.length) {
    return '无';
  }
  return props.hud.buffs.map((buff) => `${buff.name} ${Math.ceil(buff.timeLeft)}s`).join(' · ');
});

const treasureSummary = computed(() => {
  if (!props.hud.treasures.length) {
    return '无';
  }
  return props.hud.treasures.map((treasure) => treasure.name).join(' · ');
});

const companionSummary = computed(() => {
  if (!props.hud.companions.length) {
    return '无';
  }
  return props.hud.companions
    .map((companion) => {
      const manuals = companion.manualCount ? ` · 自修 ${companion.manualCount} 本` : '';
      return `${companion.name} Lv.${companion.level}${companion.guard ? '（护主）' : ''}${manuals}`;
    })
    .join(' · ');
});

const skillGroups = computed(() => {
  return ['outer', 'inner', 'light']
    .map((key) => {
      return {
        key,
        label: SKILL_CATEGORY_LABEL[key],
        skills: PLAYER_SKILLS.filter((skill) => skill.category === key),
      };
    })
    .filter((group) => group.skills.length);
});

const api = () => (props.world ? props.world.debugApi : null);

/** 统一入口：调用 core/debug.js 暴露的方法 */
const run = (method, ...args) => {
  const debugApi = api();
  if (!debugApi || !debugApi[method]) {
    return;
  }
  debugApi[method](...args);
  syncInputs();
};

const companionInfoList = () => {
  const debugApi = api();
  if (!debugApi || !debugApi.companionInfo) {
    return [];
  }
  return debugApi.companionInfo();
};

const stackOf = (skillId) => {
  return (props.world && props.world.player.skillStacks[skillId]) || 0;
};

const cdOf = (skillId) => {
  return (props.world && props.world.player.skillCooldowns[skillId]) || 0;
};

const cdText = (skillId) => {
  const left = cdOf(skillId);
  return left > 0 ? `${left.toFixed(1)}s` : '就绪';
};

const seconds = (value) => `${Math.max(0, value || 0).toFixed(1)}s`;

const buffText = (timer, multiplier) => {
  if (!timer || timer <= 0) {
    return '无';
  }
  return `${(multiplier || 1).toFixed(2)}× · ${timer.toFixed(1)}s`;
};

const applyBaseStats = () => {
  run('setBaseStat', 'baseAttack', baseInputs.value.attack);
  run('setBaseStat', 'baseDefense', baseInputs.value.defense);
  run('setBaseStat', 'baseSpeed', baseInputs.value.speed);
  run('setBaseStat', 'baseMaxHp', baseInputs.value.maxHp);
};

const spawn = () => {
  run('spawnEnemies', {
    typeId: spawnType.value,
    level: spawnLevel.value,
    count: spawnCount.value,
  });
};

const toggleGod = (event) => {
  if (props.world) {
    props.world.debug.invincible = event.target.checked;
  }
};

/** 把输入框拉回当前真实状态（等级变了 / 换 tab 时同步） */
const syncInputs = () => {
  const world = props.world;
  if (!world) {
    return;
  }
  const player = world.player;
  levelInput.value = player.level;
  hpInput.value = Math.round((player.hp / player.maxHp) * 100);
  baseInputs.value = {
    attack: Math.round(player.baseAttack),
    defense: Math.round(player.baseDefense),
    speed: Math.round(player.baseSpeed),
    maxHp: Math.round(player.baseMaxHp),
  };
};

watch(activeTab, () => syncInputs());
watch(
  () => props.hud.level,
  (level) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      return;
    }
    levelInput.value = level;
    spawnLevel.value = level;
  },
);

syncInputs();
</script>

<style scoped lang="scss">
.debug-panel {
  position: absolute;
  top: 172px;
  right: 16px;
  bottom: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: 322px;
  background: rgba(9, 11, 8, 0.94);
  border: 1px solid rgba(198, 168, 108, 0.42);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  user-select: none;
  cursor: default;
}

.debug-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(198, 168, 108, 0.18);
}

.debug-title {
  font-size: 12px;
  letter-spacing: 2px;
  color: #ffd166;
}

.debug-hint {
  flex: 1;
  font-size: 10px;
  color: rgba(244, 236, 216, 0.32);
}

.debug-close {
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: rgba(244, 236, 216, 0.6);
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.35);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ff9b8a;
    border-color: rgba(255, 155, 138, 0.6);
  }
}

.debug-tabs {
  display: flex;
  padding: 6px 8px 0;
  gap: 4px;
}

.debug-tab {
  flex: 1;
  padding: 5px 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.55);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ffe9b8;
  }
}

.debug-tab--active {
  color: #1a1508;
  background: #c6a86c;
}

.debug-body {
  flex: 1;
  padding: 8px 10px 14px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.debug-group {
  margin-top: 8px;
}

.group-title,
.section-title {
  margin-bottom: 5px;
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(198, 168, 108, 0.72);
}

.debug-section {
  padding: 7px 0;
  border-bottom: 1px dashed rgba(198, 168, 108, 0.14);

  &:last-child {
    border-bottom: none;
  }
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 21px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.86);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skill-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-stack {
  width: 30px;
  text-align: right;
  color: #ffe9b8;
}

.skill-stack--off {
  color: rgba(244, 236, 216, 0.28);
}

.relic-row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.86);
}

.relic-state {
  font-size: 10px;
  color: rgba(244, 236, 216, 0.35);

  &.relic-state--own {
    color: #ffd166;
  }
}

.cd-chip {
  width: 38px;
  padding: 1px 0;
  font-size: 10px;
  color: #ffb36b;
  background: rgba(255, 179, 107, 0.12);
  border: 1px solid rgba(255, 179, 107, 0.28);
  border-radius: 2px;
  cursor: pointer;
}

.cd-chip--ready {
  color: rgba(142, 240, 213, 0.75);
  background: rgba(142, 240, 213, 0.08);
  border-color: rgba(142, 240, 213, 0.22);
}

.mini {
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  color: #ffe9b8;
  background: rgba(198, 168, 108, 0.16);
  border: 1px solid rgba(198, 168, 108, 0.32);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: rgba(198, 168, 108, 0.32);
  }
}

.debug-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 4px 0;
}

.debug-btn {
  padding: 3px 8px;
  font-size: 10px;
  color: #ffe9b8;
  background: rgba(198, 168, 108, 0.14);
  border: 1px solid rgba(198, 168, 108, 0.32);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: rgba(198, 168, 108, 0.3);
  }
}

.field-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 4px 0;
}

.field-label {
  font-size: 10px;
  color: rgba(244, 236, 216, 0.5);
  white-space: nowrap;
}

.field-input {
  width: 54px;
  padding: 2px 4px;
  font-size: 11px;
  color: #ffe9b8;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(198, 168, 108, 0.28);
  border-radius: 2px;
  outline: none;

  &:focus {
    border-color: rgba(198, 168, 108, 0.7);
  }
}

.field-select {
  flex: 1;
  padding: 3px 4px;
  font-size: 11px;
  color: #ffe9b8;
  background: rgba(20, 22, 16, 0.9);
  border: 1px solid rgba(198, 168, 108, 0.28);
  border-radius: 2px;
  outline: none;
}

.field-note {
  font-size: 10px;
  color: rgba(244, 236, 216, 0.4);
  line-height: 1.5;
}

.stat-line {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.82);
}

.stat-name {
  width: 30px;
  color: rgba(244, 236, 216, 0.52);
}

.stat-value {
  flex: 1;
  color: #ffe9b8;
}

.debug-check {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.8);
  cursor: pointer;

  input {
    accent-color: #ffd166;
    cursor: pointer;
  }
}
</style>
