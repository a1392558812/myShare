<template>
  <div v-if="gameState.battleResult" class="result-overlay">
    <div class="result-panel">
      <h2 :class="gameState.battleResult">
        {{ gameState.battleResult === "victory" ? "🎉 胜利！" : "💀 失败..." }}
      </h2>
      <div class="result-logs">
        <p v-for="(log, index) in gameState.battleLog.slice(-5)" :key="index">
          {{ log }}
        </p>
      </div>
      <button
        v-if="gameState.battleResult === 'victory'"
        class="game-btn large"
        @click="$emit('end-battle')"
      >
        继续冒险
      </button>
      <button v-else class="game-btn large danger" @click="$emit('retry')">
        重新挑战
      </button>
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";

defineEmits(["end-battle", "retry"]);
</script>

<style scoped lang="scss">
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .result-panel {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    min-width: 400px;

    h2 {
      margin: 0 0 24px;
      font-size: 32px;

      &.victory {
        color: #4ade80;
      }

      &.defeat {
        color: #ff6b6b;
      }
    }

    .result-logs {
      margin-bottom: 32px;
      text-align: left;

      p {
        margin: 8px 0;
        color: #ccc;
        font-size: 14px;
      }
    }

    .game-btn {
      &.large {
        padding: 16px 48px;
        font-size: 16px;
      }
    }
  }
}
</style>
