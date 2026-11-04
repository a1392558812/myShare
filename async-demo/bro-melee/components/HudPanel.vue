<template>
  <div class="hud">
    <div class="hud-corner hud-corner--left">
      <div class="level-row">
        <div class="level-badge">
          <span class="level-label">境界</span>
          <span class="level-value">{{ hud.level }}</span>
        </div>
        <span v-if="hud.spawn && hud.spawn.nightmare" class="mode-badge">噩梦</span>
      </div>
      <div class="bar-group">
        <div class="bar bar--hp">
          <div class="bar-fill" :style="{ width: `${hud.hpRatio * 100}%` }"></div>
          <span class="bar-text">气血 {{ hud.hp }} / {{ hud.maxHp }}</span>
        </div>
        <div class="bar bar--exp">
          <div class="bar-fill" :style="{ width: `${hud.expRatio * 100}%` }"></div>
          <span class="bar-text">修为 {{ hud.exp }} / {{ hud.expNeed }}</span>
        </div>
      </div>
      <div class="attributes">
        <span class="attribute">攻 {{ hud.attack }}</span>
        <span class="attribute">防 {{ hud.defense }}</span>
        <span class="attribute">暴 {{ hud.critRate }}%</span>
        <span v-if="hud.shield > 0" class="attribute attribute--shield">护盾 {{ hud.shield }}</span>
      </div>
    </div>

    <div class="hud-corner hud-corner--right">
      <div class="stat-row">
        <span class="stat-label">击杀</span>
        <span class="stat-value">{{ hud.kills }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">存活</span>
        <span class="stat-value">{{ timeText }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">场上</span>
        <span class="stat-value">{{ hud.enemyCount }}</span>
      </div>
      <div class="dash-state" :class="{ 'dash-state--ready': hud.dashReady }">
        {{ hud.dashReady ? '闪避就绪' : '闪避回复中' }}
      </div>
    </div>

    <div v-if="hud.passives.length" class="passive-list">
      <div
        v-for="passive in hud.passives"
        :key="passive.id"
        class="passive-chip"
        :style="{ borderColor: passive.color, color: passive.color }"
      >
        <span class="passive-icon">{{ passive.icon }}</span>
        <span class="passive-name">{{ passive.name }}</span>
        <span class="passive-stack">×{{ passive.stack }}</span>
      </div>
    </div>

    <div v-if="hud.buffs.length || hud.treasures.length || hud.companions.length" class="status-stack">
      <div v-if="hud.buffs.length" class="status-group">
        <div
          v-for="buff in hud.buffs"
          :key="buff.id"
          class="buff-chip"
          :style="{ borderColor: buff.color, color: buff.color }"
          :title="buff.name"
        >
          <span class="buff-icon">{{ buff.icon }}</span>
          <span class="buff-name">{{ buff.name }}</span>
          <span class="buff-time">{{ buff.timeLeft.toFixed(1) }}s</span>
        </div>
      </div>

      <div v-if="hud.treasures.length" class="status-group">
        <div
          v-for="treasure in hud.treasures"
          :key="treasure.id"
          class="treasure-chip"
          :class="{ 'treasure-chip--discardable': treasure.discardable }"
          :style="{ borderColor: treasure.color, color: treasure.color }"
          :title="`${treasure.description}${treasure.discardable ? ' · 右键销毁' : ''}`"
          @contextmenu.stop.prevent="onDiscardTreasure(treasure)"
        >
          <span class="treasure-icon">{{ treasure.icon }}</span>
          <span class="treasure-name">{{ treasure.name }}</span>
        </div>
      </div>

      <div v-if="hud.companions.length" class="status-group">
        <div v-for="mate in hud.companions" :key="mate.id" class="companion-chip">
          <div class="companion-head">
            <span class="companion-name">{{ mate.name }} · Lv.{{ mate.level }}</span>
            <span v-if="mate.guard" class="companion-guard">护主</span>
          </div>
          <span class="companion-track"><i :style="{ width: `${mate.hpRatio * 100}%` }"></i></span>
          <span v-if="mate.manualCount" class="companion-manuals" title="她自己练的武功（火候六成）">
            自修 {{ mate.manualCount }} 本<template v-if="mate.manualText">：{{ mate.manualText }}</template>
          </span>
        </div>
      </div>
    </div>

    <div v-if="hud.boss" class="boss-panel">
      <div class="boss-title">
        <span class="boss-name">{{ hud.boss.name }} · Lv.{{ hud.boss.level }}</span>
        <span class="boss-distance">{{ hud.boss.distance }} 码</span>
      </div>
      <div class="boss-track">
        <div class="boss-fill" :style="{ width: `${hud.boss.hpRatio * 100}%` }"></div>
      </div>
    </div>

    <div class="relic-dock">
      <div
        v-for="relic in hud.relics"
        :key="relic.id"
        class="relic-slot"
        :class="{ 'relic-slot--owned': relic.owned, 'relic-slot--cooling': relic.owned && !relic.ready }"
        :style="{ '--relic-color': relic.color }"
        :title="relic.detail"
        @mousedown.stop.prevent="$emit('use-relic', relic.id)"
        @contextmenu.stop.prevent="$emit('drop-relic', relic.id)"
      >
        <div class="relic-mask" :style="{ height: `${relic.ratio * 100}%` }"></div>
        <span class="relic-icon">{{ relic.icon }}</span>
        <span class="relic-name">{{ relic.name }}</span>
        <span class="relic-key">{{ relic.key }}</span>
        <span v-if="relic.owned && !relic.ready" class="relic-cooldown">{{ relic.cooldownLeft.toFixed(1) }}</span>
        <span v-else-if="relic.owned" class="relic-skill">{{ relic.skillName }}</span>
        <span v-else class="relic-locked">未持有</span>
      </div>
      <div v-if="hud.relicHunted" class="relic-alert">神兵在手 · 高手正在追杀</div>
    </div>

    <div class="skill-dock">
      <div class="skill-bar" :class="{ 'skill-bar--expanded': skillsExpanded }">
        <div
          v-for="skill in visibleSkills"
          :key="skill.id"
          class="skill-slot"
          :class="{ 'skill-slot--cooling': !skill.ready, 'skill-slot--auto': hud.autoCast && skill.ready }"
          :style="{ '--skill-color': skill.color }"
          @mousedown.stop.prevent="$emit('use-skill', skill.id)"
        >
          <div class="skill-mask" :style="{ height: `${skill.ratio * 100}%` }"></div>
          <span class="skill-icon">{{ skill.icon }}</span>
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-key">{{ keyLabel(skill) }}</span>
          <span v-if="skill.stack > 1" class="skill-stack">×{{ skill.stack }}</span>
          <span v-if="!skill.ready" class="skill-cooldown">{{ skill.cooldownLeft.toFixed(1) }}</span>
          <span v-if="skill.detail" class="skill-tooltip">{{ skill.name }} · {{ skill.detail }}</span>
        </div>
        <button v-if="hud.activeSkills.length > COLLAPSED_COUNT" class="skill-more" type="button" @mousedown.stop.prevent="skillsExpanded = !skillsExpanded">
          {{ skillsExpanded ? '收起 ˄' : `展开 ${hud.activeSkills.length - COLLAPSED_COUNT} ˅` }}
        </button>
        <div v-if="!hud.activeSkills.length" class="skill-empty">
          每 5 级可三选一秘籍，外功会出现在这里
        </div>
      </div>
      <button class="bind-entry" type="button" title="键位设置（也可在开局前的主界面配置）" @mousedown.stop.prevent="$emit('open-keybinds')">
        <span class="bind-entry-label">改键</span>
      </button>
      <button
        class="attack-mode"
        type="button"
        title="普攻模式：自动（贴脸近战，远了飞掷）/ 近战 / 远程（G 切换）"
        @mousedown.stop.prevent="$emit('cycle-attack')"
      >
        <span class="mode-label">普攻</span>
        <span class="mode-state">{{ attackModeLabel }}</span>
        <span class="mode-key">G</span>
      </button>
      <button
        class="auto-toggle"
        :class="{ 'auto-toggle--on': hud.autoCast }"
        type="button"
        title="自动战斗：先挑武功放，技能都在冷却时穿插普攻（F）"
        @mousedown.stop.prevent="$emit('toggle-auto')"
      >
        <span class="auto-label">自动</span>
        <span class="auto-state">{{ hud.autoCast ? '开' : '关' }}</span>
        <span class="auto-key">F</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { formatTime } from '../core/utils.js';

const COLLAPSED_COUNT = 8;

const props = defineProps({
  hud: {
    type: Object,
    required: true,
  },
  keybinds: {
    type: Object,
    default: () => ({}),
  },
  keybindLabelOf: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['use-skill', 'toggle-auto', 'use-relic', 'drop-relic', 'discard-treasure', 'cycle-attack', 'open-keybinds']);

/** 技能多于一行时折叠，点「展开」看全部 */
const skillsExpanded = ref(false);

const visibleSkills = computed(() => {
  const skills = props.hud.activeSkills || [];
  return skillsExpanded.value ? skills : skills.slice(0, COLLAPSED_COUNT);
});

/** 槽位显示：优先自定义键，其次默认 1-9 */
const keyLabel = (skill) => {
  return props.keybindLabelOf(skill.id, skill.slot);
};

const ATTACK_MODE_LABELS = {
  auto: '自动',
  melee: '近战',
  ranged: '远程',
};

const attackModeLabel = computed(() => {
  return ATTACK_MODE_LABELS[props.hud.attackMode] || '自动';
});

const timeText = computed(() => {
  return formatTime(props.hud.time);
});

const onDiscardTreasure = (treasure) => {
  if (!treasure.discardable) {
    return;
  }
  emit('discard-treasure', treasure.id);
};
</script>

<style scoped lang="scss">
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  color: #f4ecd8;
  user-select: none;
}

.hud-corner {
  position: absolute;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-corner--left {
  left: 18px;
  width: 264px;
}

.hud-corner--right {
  right: 18px;
  align-items: flex-end;
  padding: 10px 14px;
  background: rgba(12, 14, 10, 0.6);
  border: 1px solid rgba(198, 168, 108, 0.3);
  border-radius: 3px;
  min-width: 132px;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
}

.level-badge {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 12px;
  align-self: flex-start;
  background: linear-gradient(120deg, rgba(198, 168, 108, 0.28), rgba(12, 14, 10, 0.4));
  border: 1px solid rgba(198, 168, 108, 0.5);
  border-radius: 3px;
}

.mode-badge {
  padding: 2px 8px;
  font-size: 11px;
  letter-spacing: 2px;
  color: #ff9b8a;
  border: 1px solid rgba(224, 85, 69, 0.55);
  border-radius: 2px;
  background: rgba(224, 85, 69, 0.12);
}

.level-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: #c6a86c;
}

.level-value {
  font-size: 22px;
  font-weight: bold;
  line-height: 1;
  color: #ffe9b8;
  text-shadow: 0 0 12px rgba(255, 209, 102, 0.45);
}

.bar-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bar {
  position: relative;
  height: 17px;
  background: rgba(8, 10, 7, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  transition: width 0.12s linear;
}

.bar--hp .bar-fill {
  background: linear-gradient(90deg, #8c2f28, #d94a3d);
}

.bar--exp .bar-fill {
  background: linear-gradient(90deg, #2b6b7a, #7be3ff);
}

.bar--exp {
  height: 11px;
}

.bar-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  letter-spacing: 1px;
  color: #f4ecd8;
  text-shadow: 0 1px 2px #000;
}

.attributes {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.62);
}

.attribute--shield {
  color: #9aa8ff;
}

.stat-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}

.stat-label {
  color: rgba(198, 168, 108, 0.75);
  letter-spacing: 2px;
}

.stat-value {
  font-size: 15px;
  font-weight: bold;
  color: #ffe9b8;
}

.dash-state {
  margin-top: 2px;
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.35);
}

.dash-state--ready {
  color: #8ef0d5;
}

.passive-list {
  position: absolute;
  left: 18px;
  top: 158px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 210px;
}

.passive-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  font-size: 11px;
  background: rgba(10, 12, 9, 0.62);
  border-left: 2px solid;
  border-radius: 2px;
}

.passive-icon {
  font-weight: bold;
}

.passive-stack {
  font-size: 10px;
  opacity: 0.75;
}

.boss-panel {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  padding: 6px 12px 8px;
  background: rgba(14, 8, 8, 0.72);
  border: 1px solid rgba(224, 85, 69, 0.5);
  border-radius: 3px;
}

.boss-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 5px;
}

.boss-name {
  color: #ff9b8a;
  letter-spacing: 2px;
}

.boss-distance {
  font-size: 10px;
  color: rgba(255, 155, 138, 0.55);
}

.boss-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.6);
}

.boss-fill {
  height: 100%;
  background: linear-gradient(90deg, #8c1f1a, #ff5c5c);
  transition: width 0.12s linear;
}

.relic-dock {
  position: absolute;
  left: 50%;
  bottom: 104px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.relic-slot {
  position: relative;
  width: 118px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  overflow: hidden;
  background: rgba(10, 12, 9, 0.82);
  border: 1px solid rgba(198, 168, 108, 0.26);
  border-radius: 2px;
  color: rgba(244, 236, 216, 0.4);
  font-size: 11px;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    opacity: 1;
  }

  &.relic-slot--owned {
    opacity: 1;
    color: #ffe9b8;
    border-color: var(--relic-color);
    box-shadow: 0 0 16px rgba(255, 209, 102, 0.18);
  }

  &.relic-slot--cooling {
    color: rgba(244, 236, 216, 0.62);
  }
}

.relic-mask {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.58);
}

.relic-icon {
  position: relative;
  font-size: 17px;
  color: var(--relic-color);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.16);
}

.relic-name {
  position: relative;
  letter-spacing: 1px;
}

.relic-key {
  position: relative;
  margin-left: auto;
  padding: 1px 5px;
  font-size: 10px;
  border: 1px solid rgba(198, 168, 108, 0.4);
  border-radius: 2px;
}

.relic-skill,
.relic-locked {
  position: relative;
  font-size: 10px;
  color: rgba(244, 236, 216, 0.45);
}

.relic-cooldown {
  position: absolute;
  right: 8px;
  bottom: 4px;
  font-size: 11px;
  color: #ffd166;
}

.relic-alert {
  padding: 5px 12px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #ff9b8a;
  background: rgba(10, 12, 9, 0.82);
  border: 1px solid rgba(224, 85, 69, 0.5);
  border-radius: 2px;
  animation: relic-alert 1.5s ease-in-out infinite;
}

@keyframes relic-alert {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.skill-dock {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 12px;
  pointer-events: auto;
}

.skill-bar {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: center;
  gap: 8px;
  max-width: 552px;

  &--expanded {
    max-width: 760px;
  }
}

/* 展开按钮：占据槽位大小的右下角小方块 */
.skill-more {
  width: 64px;
  height: 64px;
  padding: 0;
  background: rgba(10, 12, 9, 0.78);
  border: 1px dashed rgba(198, 168, 108, 0.55);
  border-radius: 3px;
  color: rgba(244, 236, 216, 0.7);
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.14s ease;

  &:hover {
    color: #ffd166;
    border-color: #ffd166;
  }
}

/* 悬停秘籍详情：槽位上方浮层 */
.skill-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  width: 210px;
  padding: 7px 9px;
  background: rgba(8, 10, 8, 0.96);
  border: 1px solid var(--skill-color);
  border-radius: 4px;
  color: rgba(244, 236, 216, 0.92);
  font-size: 11px;
  line-height: 1.55;
  text-align: left;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.12s ease;
  z-index: 20;
}

.skill-slot:hover .skill-tooltip {
  opacity: 1;
}

/* 改键入口：技能坞左下小按钮 */
.bind-entry {
  width: 40px;
  height: 64px;
  padding: 0;
  background: rgba(10, 12, 9, 0.78);
  border: 1px solid rgba(198, 168, 108, 0.42);
  border-radius: 3px;
  color: rgba(244, 236, 216, 0.62);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    color: #ffd166;
    border-color: rgba(198, 168, 108, 0.8);
    transform: translateY(-3px);
  }
}

.bind-entry-label {
  writing-mode: vertical-lr;
  letter-spacing: 3px;
  font-size: 11px;
}

.auto-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 54px;
  height: 64px;
  padding: 0;
  background: rgba(10, 12, 9, 0.78);
  border: 1px solid rgba(198, 168, 108, 0.42);
  border-radius: 3px;
  color: rgba(244, 236, 216, 0.6);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.auto-toggle--on {
  border-color: #8ef0d5;
  color: #8ef0d5;
  background: rgba(12, 30, 26, 0.86);
  box-shadow: 0 0 14px rgba(142, 240, 213, 0.25);
}

.auto-label {
  font-size: 10px;
  letter-spacing: 1px;
  opacity: 0.75;
}

.auto-state {
  font-size: 17px;
  font-weight: bold;
  line-height: 1.1;
}

.auto-key {
  font-size: 9px;
  opacity: 0.45;
}

.attack-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 54px;
  height: 64px;
  padding: 0;
  background: rgba(10, 12, 9, 0.78);
  border: 1px solid rgba(142, 240, 213, 0.36);
  border-radius: 3px;
  color: rgba(142, 240, 213, 0.85);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.mode-label {
  font-size: 10px;
  letter-spacing: 1px;
  opacity: 0.75;
}

.mode-state {
  font-size: 17px;
  font-weight: bold;
  line-height: 1.1;
}

.mode-key {
  font-size: 9px;
  opacity: 0.45;
}

.skill-slot--auto {
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.22);
}

.skill-slot {
  position: relative;
  width: 64px;
  height: 64px;
  background: rgba(10, 12, 9, 0.78);
  border: 1px solid var(--skill-color);
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.skill-slot--cooling {
  border-color: rgba(120, 120, 110, 0.5);
}

.skill-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(4, 6, 4, 0.72);
  transition: height 0.1s linear;
}

.skill-icon {
  position: relative;
  display: block;
  text-align: center;
  margin-top: 8px;
  font-size: 20px;
  font-weight: bold;
  color: var(--skill-color);
}

.skill-name {
  position: relative;
  display: block;
  margin-top: 2px;
  font-size: 10px;
  text-align: center;
  color: rgba(244, 236, 216, 0.78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 3px;
}

.skill-key {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  color: rgba(244, 236, 216, 0.45);
}

.skill-stack {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  color: #ffd166;
}

.skill-cooldown {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: bold;
  color: rgba(244, 236, 216, 0.85);
  text-shadow: 0 1px 3px #000;
}

.skill-empty {
  padding: 18px 22px;
  font-size: 12px;
  color: rgba(198, 168, 108, 0.5);
  background: rgba(10, 12, 9, 0.6);
  border: 1px dashed rgba(198, 168, 108, 0.3);
  border-radius: 3px;
}

.status-stack {
  position: absolute;
  right: 18px;
  top: 132px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  max-width: 210px;
}

.status-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.buff-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  font-size: 11px;
  background: rgba(10, 12, 9, 0.68);
  border-left: 2px solid;
  border-radius: 2px;
}

.buff-icon {
  font-weight: bold;
}

.buff-time {
  font-size: 10px;
  color: rgba(244, 236, 216, 0.5);
}

.treasure-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  font-size: 11px;
  background: rgba(10, 12, 9, 0.72);
  border: 1px solid;
  border-radius: 2px;
  pointer-events: auto;
}

.treasure-chip--discardable {
  cursor: context-menu;

  &:hover {
    background: rgba(224, 85, 69, 0.18);
  }
}

.treasure-icon {
  font-weight: bold;
}

.companion-chip {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  width: 208px;
  padding: 4px 8px;
  font-size: 11px;
  color: #8ef0d5;
  background: rgba(10, 12, 9, 0.68);
  border-left: 2px solid #8ef0d5;
  border-radius: 2px;
  box-sizing: border-box;
}

.companion-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.companion-track {
  width: 100%;
  height: 3px;
  background: rgba(142, 240, 213, 0.2);

  i {
    display: block;
    height: 100%;
    background: #8ef0d5;
  }
}

.companion-guard {
  font-size: 10px;
  color: #ffd166;
}

.companion-manuals {
  font-size: 10px;
  color: rgba(232, 246, 255, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
