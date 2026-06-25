<template>
  <div class="player-status-panel">
    <!-- 生命值 -->
    <div class="hud-hp">
      <div class="hud-hp-bar" :style="{ width: hpPercent + '%' }"></div>
      <span class="hud-hp-text">{{ player.hp }} / {{ maxHp }}</span>
    </div>
    <!-- 等级 & 经验 -->
    <div class="hud-level">
      <span>Lv.{{ player.level }}</span>
      <div class="hud-exp-bar">
        <div class="hud-exp-fill" :style="{ width: expPercent + '%' }"></div>
      </div>
      <span class="hud-exp-text">{{ player.exp }} / {{ nextLevelExp }}</span>
    </div>
    <div class="hud-time">存活 {{ formatTime(gameTime) }}</div>
    <div class="hud-time">金币 {{ player.gold }}</div>
    <div class="hud-kills">击杀 {{ killCount }}</div>
  </div>
</template>

<script setup>
defineProps({
  player: { type: Object, required: true },
  maxHp: { type: Number, required: true },
  hpPercent: { type: Number, required: true },
  expPercent: { type: Number, required: true },
  nextLevelExp: { type: Number, required: true },
  gameTime: { type: Number, required: true },
  killCount: { type: Number, required: true },
  formatTime: { type: Function, required: true },
})
</script>

<style scoped lang="scss">
.player-status-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Segoe UI', sans-serif;
  color: #e2e8f0;
}

.hud-hp {
  position: relative;
  width: 200px;
  height: 22px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.5);

  .hud-hp-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #ef4444, #dc2626);
    transition: width 0.3s;
    border-radius: 4px;
  }

  .hud-hp-text {
    position: absolute;
    width: 100%;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    line-height: 22px;
    color: #f1f5f9;
  }
}

.hud-level {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;

  .hud-exp-bar {
    width: 120px;
    height: 10px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.4);

    .hud-exp-fill {
      height: 100%;
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      transition: width 0.3s;
      border-radius: 3px;
    }
  }

  .hud-exp-text {
    font-size: 11px;
    color: #94a3b8;
  }
}

.hud-time,
.hud-kills {
  font-size: 13px;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.6);
  padding: 4px 10px;
  border-radius: 4px;
}
</style>
