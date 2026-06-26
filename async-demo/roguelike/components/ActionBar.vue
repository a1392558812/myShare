<template>
  <div class="action-bar">
    <div v-for="(sk, idx) in skills" :key="idx" class="skill-slot" :class="{
      'skill-empty': !sk,
      'skill-cooldown': sk && sk.remainingCooldown > 0,
      'skill-active': sk && sk.active
    }" @click="sk && $emit('skill-click', sk)">
      <template v-if="sk">
        <span class="skill-icon">{{ sk.icon }}</span>
        <span class="skill-level">Lv{{ sk.currentLevel }}</span>
        <span v-if="sk.remainingCooldown > 0" class="skill-cd-text">
          {{ Math.ceil(sk.remainingCooldown / 1000) }}s
        </span>
        <span v-else-if="sk.active && getActiveRemaining(sk)" class="skill-active-text">
          {{ getActiveRemaining(sk) }}s
        </span>
      </template>
      <span class="skill-key">{{ SKILL_KEY_MAP[sk.id] }}</span>
    </div>
  </div>
</template>

<script setup>
import {
  SKILL_KEY_MAP,
} from '../constants.js'

const props = defineProps({
  skills: { type: Array, required: true },
})

const getActiveRemaining = (sk) => {
  if (sk.id === 'invincible') return Math.ceil((sk.invincibleTimer || 0) / 1000)
  if (sk.id === 'vampireAura') return Math.ceil((sk.auraTimer || 0) / 1000)
  if (sk.id === 'dash') return Math.ceil((sk.dashTimer || 0) / 1000)
  return ''
}

defineEmits(['skill-click'])
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  gap: 6px;
}

.skill-slot {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(100, 116, 139, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: #fbbf24;
    background: rgba(50, 61, 79, 0.9);
  }

  &.skill-empty {
    opacity: 0.25;
    cursor: default;
    border-style: dashed;

    &:hover {
      border-color: rgba(100, 116, 139, 0.4);
      background: rgba(30, 41, 59, 0.8);
    }
  }

  &.skill-cooldown {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: rgba(100, 116, 139, 0.3);
  }

  &.skill-active {
    border-color: #fbbf24;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    animation: activePulse 0.7s ease-in-out infinite alternate;
  }

  .skill-icon {
    font-size: 20px;
  }

  .skill-level {
    font-size: 9px;
    color: #94a3b8;
  }

  .skill-cd-text {
    position: absolute;
    bottom: 2px;
    font-size: 10px;
    color: #fbbf24;
    font-weight: 600;
  }

  .skill-active-text {
    position: absolute;
    bottom: 2px;
    font-size: 10px;
    color: #4ade80;
    font-weight: 600;
  }

  .skill-key {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
  }
}

@keyframes activePulse {
  0%   { box-shadow: 0 0 6px rgba(251, 191, 36, 0.35); }
  100% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.65); }
}
</style>
</template></template>