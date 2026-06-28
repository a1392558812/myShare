<template>
  <div class="action-bar">
    <div v-for="(sk, idx) in skills" :key="idx" class="skill-slot" :class="{
      'skill-empty': !sk,
      'skill-cooldown': sk && sk.remainingCooldown > 0,
      'skill-active': sk && sk.active
    }" @click="sk && $emit('skill-click', sk)">
      <div v-if="sk && sk.remainingCooldown > 0" class="cd-overlay" :style="getCdOverlayStyle(sk)"></div>
      <div v-if="sk && sk.active && getActiveTotal(sk) > 0"
           class="active-bar">
        <div class="active-bar-fill" :style="getActiveBarStyle(sk)"></div>
      </div>

      <template v-if="sk">
        <span class="skill-icon">{{ sk.icon }}</span>
        <span class="skill-level">Lv{{ sk.currentLevel }}</span>
      </template>
      <span class="skill-key">{{ sk ? SKILL_KEY_MAP[sk.id] : '' }}</span>
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

const getCdOverlayStyle = (sk) => {
  const total = sk.cooldown || 1
  const ratio = sk.remainingCooldown / total
  return {
    transform: `scaleY(${ratio})`,
  }
}

const getActiveTotal = (sk) => {
  if (sk.id === 'invincible') return sk.invincibleTotalDuration || 0
  if (sk.id === 'vampireAura') return sk.duration || 0
  if (sk.id === 'dash') return sk.dashDuration || 0
  return 0
}

const getActiveBarStyle = (sk) => {
  const total = getActiveTotal(sk)
  if (!total) return { transform: 'scaleX(0)' }
  let remaining = 0
  if (sk.id === 'invincible') remaining = sk.invincibleTimer || 0
  if (sk.id === 'vampireAura') remaining = sk.auraTimer || 0
  if (sk.id === 'dash') remaining = sk.dashTimer || 0
  const ratio = Math.max(0, Math.min(1, remaining / total))
  return {
    transform: `scaleX(${ratio})`,
  }
}

defineEmits(['skill-click'])
</script>

<style>
.action-bar {
  display: flex;
  gap: 6px;
}

.skill-slot {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.9);
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
    background: rgba(50, 61, 79, 0.95);
  }

  &.skill-empty {
    opacity: 0.25;
    cursor: default;
    border-style: dashed;

    &:hover {
      border-color: rgba(100, 116, 139, 0.4);
      background: rgba(30, 41, 59, 0.9);
    }
  }

  &.skill-cooldown {
    opacity: 0.7;
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
    z-index: 2;
    position: relative;
  }

  .skill-level {
    font-size: 9px;
    color: #94a3b8;
    z-index: 2;
    position: relative;
  }

  .skill-key {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
    z-index: 2;
  }
}

.cd-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1;
  pointer-events: none;
  transform-origin: bottom;
  will-change: transform;
  transition: transform 0.15s linear;
  border-radius: 0 0 4px 4px;
}

.active-bar {
  position: absolute;
  bottom: -6px;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(74, 222, 128, 0.25);
  border-radius: 2px;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.active-bar-fill {
  width: 100%;
  height: 100%;
  background: #4ade80;
  border-radius: 2px;
  transform-origin: left;
  will-change: transform;
  transition: transform 0.15s linear;
}

@keyframes activePulse {
  0%   { box-shadow: 0 0 6px rgba(251, 191, 36, 0.35); }
  100% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.65); }
}
</style>
