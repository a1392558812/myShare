<template>
  <div class="battle-info">
    <div class="turn-indicator">
      <span class="round-number">第 {{ currentRound }} 回合</span>
      <span class="phase-indicator" :class="currentPhaseClass">
        {{ currentPhaseText }}
      </span>
    </div>
    <div class="enemy-count">
      剩余敌人: {{ aliveEnemies.length }} /
      {{ gameState.currentBattle?.enemies?.length || 0 }}
    </div>
    <div class="turn-order">行动顺序: {{ turnOrderDisplay }}</div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";

defineProps({
  currentRound: { type: Number, required: true },
  currentPhaseText: { type: String, required: true },
  currentPhaseClass: { type: String, required: true },
  aliveEnemies: { type: Array, required: true },
  turnOrderDisplay: { type: String, required: true },
});
</script>

<style scoped lang="scss">
.battle-info {
  text-align: center;

  .turn-indicator {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.5);
    padding: 12px 24px;
    border-radius: 30px;

    .round-number {
      color: #fbbf24;
      font-weight: bold;
    }

    .phase-indicator {
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 16px;

      &.command-phase {
        background: #3b82f6;
        color: white;
      }

      &.execution-phase {
        background: #f59e0b;
        color: white;
      }
    }
  }

  .enemy-count {
    margin-top: 8px;
    color: #ff6b6b;
    font-size: 14px;
  }

  .turn-order {
    margin-top: 4px;
    color: #a5b4fc;
    font-size: 12px;
  }
}
</style>
