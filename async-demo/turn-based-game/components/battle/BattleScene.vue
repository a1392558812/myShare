<template>
  <div class="battle-scene">
    <div class="enemies-container">
      <div
        v-for="(enemy, index) in enemies"
        :key="enemy.id"
        class="enemy-unit"
        :class="{
          dead: enemy.hp <= 0,
          selected: selectedTargetIndex === index && enemy.hp > 0,
        }"
        @click="onSelectTarget(index)"
      >
        <div class="char-display">
          <div class="char-info">
            <h4>{{ enemy.name }} {{ enemy.hp <= 0 ? "(已击杀)" : "" }}</h4>
            <!-- 敌人 buff/debuff 显示 -->
            <div class="buff-list enemy-buffs" v-if="enemy.buffs && enemy.buffs.length > 0">
              <span
                v-for="(buff, buffIndex) in enemy.buffs"
                :key="buffIndex"
                class="buff-badge"
                :class="getBuffClass(buff.type)"
              >
                {{ buff.name }} ({{ buff.remainingTurns }})
              </span>
            </div>
            <div class="hp-bar">
              <span class="label">HP:</span>
              <span class="value"
                >{{ formatStat(Math.max(0, enemy.hp)) }}/{{
                  formatStat(enemy.maxHp)
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="character-area player-area">
      <div class="char-display">
        <div class="char-sprite player-sprite">
          {{ player.name }}
        </div>
        <div class="char-info">
          <h4>{{ player.name }}</h4>
          <div class="decision-badge" v-if="decisionText">
            已决策: {{ decisionText }}
          </div>
          <div class="buff-list" v-if="playerBuffs && playerBuffs.length > 0">
            <span
              v-for="(buff, index) in playerBuffs"
              :key="index"
              class="buff-badge"
              :class="getBuffClass(buff.type)"
            >
              {{ buff.name }} ({{ buff.remainingTurns }})
            </span>
          </div>
          <div class="hp-bar">
            <span class="label">HP</span>
            <div class="bar-bg">
              <div
                class="bar-fill hp-fill"
                :style="{
                  width: (player.hp / player.maxHp) * 100 + '%',
                }"
              ></div>
            </div>
            <span class="value"
              >{{ formatStat(Math.max(0, player.hp)) }}/{{
                formatStat(player.maxHp)
              }}</span
            >
          </div>
          <div class="mp-bar">
            <span class="label">MP</span>
            <div class="bar-bg">
              <div
                class="bar-fill mp-fill"
                :style="{
                  width: (player.mp / player.maxMp) * 100 + '%',
                }"
              ></div>
            </div>
            <span class="value"
              >{{ formatStat(player.mp) }}/{{ formatStat(player.maxMp) }}</span
            >
          </div>
        </div>
      </div>

      <div class="char-display pet" v-if="pet && pet.active">
        <div class="char-sprite pet-sprite" :class="{ dead: pet.hp <= 0 }">
          {{ pet.name }}
        </div>
        <div class="char-info">
          <h4>
            {{ pet.name }}
            {{ pet.hp <= 0 ? "(已退场)" : "" }}
          </h4>
          <div class="decision-badge" v-if="petDecisionText">
            已决策: {{ petDecisionText }}
          </div>
          <div class="buff-list" v-if="petBuffs && petBuffs.length > 0">
            <span
              v-for="(buff, index) in petBuffs"
              :key="index"
              class="buff-badge pet-buff"
              :class="getBuffClass(buff.type)"
            >
              {{ buff.name }} ({{ buff.remainingTurns }})
            </span>
          </div>
          <div class="hp-bar">
            <span class="label">HP</span>
            <div class="bar-bg">
              <div
                class="bar-fill hp-fill"
                :style="{
                  width: Math.max(0, (pet.hp / pet.maxHp) * 100) + '%',
                }"
              ></div>
            </div>
            <span class="value"
              >{{ formatStat(Math.max(0, pet.hp)) }}/{{
                formatStat(pet.maxHp)
              }}</span
            >
          </div>
          <div class="mp-bar">
            <span class="label">MP</span>
            <div class="bar-bg">
              <div
                class="bar-fill mp-fill"
                :style="{
                  width: Math.max(0, (pet.mp / pet.maxMp) * 100) + '%',
                }"
              ></div>
            </div>
            <span class="value"
              >{{ formatStat(pet.mp) }}/{{ formatStat(pet.maxMp) }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatStat } from "../../stores/utils.js";

defineProps({
  enemies: { type: Array, required: true },
  selectedTargetIndex: { type: Number, required: true },
  onSelectTarget: { type: Function, required: true },
  player: { type: Object, required: true },
  pet: { type: Object, default: null },
  decisionText: { type: String, default: "" },
  petDecisionText: { type: String, default: "" },
  playerBuffs: { type: Array, default: () => [] },
  petBuffs: { type: Array, default: () => [] },
});

const getBuffClass = (type) => {
  switch (type) {
    case "heal":
      return "buff-heal";
    case "physicalAttack":
    case "magicAttack":
      return "buff-attack";
    case "defense":
      return "buff-defense";
    case "speed":
      return "buff-speed";
    // debuff 类型
    case "poison":
      return "debuff-poison";
    case "freeze":
      return "debuff-freeze";
    case "seal":
      return "debuff-seal";
    case "confuse":
      return "debuff-confuse";
    default:
      return "buff-default";
  }
};
</script>

<style scoped lang="scss">
.battle-scene {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  overflow-y: auto;

  .enemies-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-bottom: 20px;

    .enemy-unit {
      width: 120px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      padding: 8px;
      border-radius: 8px;
      border: 2px solid #fff;

      &.selected {
        border-color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
      }

      .enemy-buffs {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-bottom: 4px;

        .buff-badge {
          padding: 1px 4px;
          font-size: 8px;
        }
      }

      &.dead {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(.dead):hover {
        transform: scale(1.02);
      }
    }
  }

  .character-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .char-display {
      display: flex;
      align-items: center;
      gap: 24px;

      .char-sprite {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        text-shadow: 0 0 5px black;
        font-size: 14px;

        &.player-sprite {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border: 4px solid #0077b6;
          box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
        }

        &.pet-sprite {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border: 3px solid #6d28d9;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);

          &.dead {
            background: linear-gradient(135deg, #444, #333);
            border-color: #222;
            box-shadow: none;
            opacity: 0.5;
          }
        }
      }

      .char-info {
        h4 {
          margin: 0 0 8px;
          color: white;
          font-size: 18px;
        }

        .decision-badge {
          display: inline-block;
          margin-bottom: 8px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .buff-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .buff-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: bold;

          &.buff-heal {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
          }

          &.buff-attack {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
          }

          &.buff-defense {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
          }

          &.buff-speed {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
          }

          &.pet-buff {
            opacity: 0.9;
          }

          // debuff 样式
          &.debuff-poison {
            background: linear-gradient(135deg, #84cc16, #65a30d);
            color: white;
          }

          &.debuff-freeze {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
          }

          &.debuff-seal {
            background: linear-gradient(135deg, #a855f7, #7c3aed);
            color: white;
          }

          &.debuff-confuse {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
          }
        }

        .hp-bar,
        .mp-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .label {
            width: 30px;
            color: #aaa;
            font-size: 14px;
          }

          .bar-bg {
            width: 150px;
            height: 12px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;

            .bar-fill {
              height: 100%;
              transition: width 0.3s;

              &.hp-fill {
                background: linear-gradient(90deg, #ff4757, #ff6b81);
              }

              &.mp-fill {
                background: linear-gradient(90deg, #4facfe, #00f2fe);
              }
            }
          }

          .value {
            width: 70px;
            color: white;
            font-size: 14px;
            text-align: right;
          }
        }
      }
    }
    .char-display.pet {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .decision-badge {
        background: linear-gradient(135deg, #a855f7, #7c3aed);
      }
    }
  }
}
</style>
