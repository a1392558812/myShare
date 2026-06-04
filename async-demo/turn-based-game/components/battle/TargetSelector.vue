<template>
  <div v-if="show" class="target-selector-overlay">
    <div class="target-selector-panel">
      <h3>{{ title }}</h3>
      <div class="item-info">
        <span class="user-label">{{ userLabel }}</span>
        {{ labelPrefix }}: <span class="item-name">{{ itemName }}</span>
      </div>

      <!-- 道具目标选择（玩家/宠物） -->
      <div v-if="type === 'item'" class="target-buttons">
        <button
          class="target-btn player-btn"
          @click="onSelectTarget('player')"
        >
          <div class="target-icon">🧙</div>
          <div class="target-name">玩家</div>
          <div class="target-status" :class="{ dead: player.hp <= 0 }">
            HP: {{ formatStat(Math.max(0, player.hp)) }}/{{ formatStat(player.maxHp) }}
            <span v-if="player.hp <= 0" class="dead-text">(已击败)</span>
          </div>
        </button>
        <button
          v-if="pet && pet.active"
          class="target-btn pet-btn"
          @click="onSelectTarget('pet')"
        >
          <div class="target-icon">🐾</div>
          <div class="target-name">{{ pet.name }}</div>
          <div class="target-status" :class="{ dead: pet.hp <= 0 }">
            HP: {{ formatStat(Math.max(0, pet.hp)) }}/{{ formatStat(pet.maxHp) }}
            <span v-if="pet.hp <= 0" class="dead-text">(已击败)</span>
          </div>
        </button>
      </div>

      <!-- 技能目标选择（敌人列表） -->
      <div v-else-if="type === 'skill'" class="enemy-buttons">
        <div
          v-for="(enemy, index) in enemies"
          :key="enemy.id"
          class="enemy-btn"
          :class="{ dead: enemy.hp <= 0, selected: index === selectedTargetIndex }"
          @click="onSelectEnemy(enemy, index)"
        >
          <div class="enemy-icon">👹</div>
          <div class="enemy-name">{{ enemy.name }}</div>
          <div class="enemy-status">
            HP: {{ formatStat(Math.max(0, enemy.hp)) }}/{{ formatStat(enemy.maxHp) }}
          </div>
          <div v-if="enemy.hp <= 0" class="dead-label">已死亡</div>
        </div>
      </div>

      <button class="cancel-btn" @click="onCancel">取消</button>
    </div>
  </div>
</template>

<script setup>
import { formatStat } from "../../stores/utils.js";

const props = defineProps({
  show: { type: Boolean, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  userLabel: { type: String, required: true },
  labelPrefix: { type: String, required: true },
  itemName: { type: String, required: true },
  player: { type: Object, required: true },
  pet: { type: Object, default: null },
  enemies: { type: Array, default: () => [] },
  selectedTargetIndex: { type: Number, default: -1 },
});

const emit = defineEmits(["select-target", "select-enemy", "cancel"]);

const onSelectTarget = (targetType) => {
  emit("select-target", targetType);
};

const onSelectEnemy = (enemy, index) => {
  if (enemy.hp <= 0) return;
  emit("select-enemy", enemy, index);
};

const onCancel = () => {
  emit("cancel");
};
</script>

<style scoped lang="scss">
.target-selector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .target-selector-panel {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    min-width: 350px;

    h3 {
      margin: 0 0 16px;
      color: #fbbf24;
      font-size: 20px;
    }

    .item-info {
      margin-bottom: 24px;
      color: #aaa;
      font-size: 14px;

      .user-label {
        display: inline-block;
        margin-right: 8px;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        font-size: 12px;
      }

      .item-name {
        color: #4ade80;
        font-weight: bold;
      }
    }

    .target-buttons,
    .enemy-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 24px;

      .target-btn {
        padding: 20px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 140px;

        &:hover {
          transform: translateY(-4px);
        }

        &.player-btn {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        &.pet-btn {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
        }

        .target-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .target-name {
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .target-status {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          line-height: 1.4;

          &.dead {
            color: #ef4444;
          }

          .dead-text {
            display: block;
            color: #fbbf24;
            font-weight: bold;
            margin-top: 2px;
          }
        }
      }

      .enemy-btn {
        padding: 20px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 140px;
        position: relative;

        &:not(.dead):hover {
          transform: translateY(-4px);
        }

        &.dead {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.selected {
          border: 3px solid #ff6b6b;
        }

        background: linear-gradient(135deg, #ef4444, #dc2626);

        .enemy-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .enemy-name {
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .enemy-status {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }

        .dead-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          color: #fbbf24;
          font-weight: bold;
          font-size: 18px;
          text-shadow: 0 0 5px black;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 16px;
          border-radius: 8px;
        }
      }
    }

    .cancel-btn {
      padding: 12px 32px;
      background: linear-gradient(135deg, #6b7280, #4b5563);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}
</style>
