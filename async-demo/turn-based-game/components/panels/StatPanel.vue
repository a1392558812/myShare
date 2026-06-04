<template>
  <div class="stat-panel">
    <h3>📊 属性</h3>

    <div class="basic-info">
      <div v-for="(value, key) in basicInfo" :key="key" class="info-row">
        <span class="label">{{ key }}</span>
        <span v-if="typeof value === 'object'" class="value" :class="{ active: value.isActive }">
          {{ value.text }}
          <button
            v-if="value.action && value.actionText"
            class="toggle-btn"
            @click="value.action"
          >
            {{ value.actionText }}
          </button>
        </span>
        <span v-else class="value">{{ value }}</span>
      </div>
    </div>

    <div v-if="expInfo" class="exp-bar">
      <div class="exp-label">经验值</div>
      <div class="exp-bar-bg">
        <div
        class="exp-bar-fill"
        :style="{ width: `${(expInfo.current / expInfo.max) * 100}%` }"
      ></div>
      </div>
      <div class="exp-text">{{ expInfo.current }} / {{ expInfo.max }}</div>
    </div>

    <div class="stat-sub-section">
      <h4 class="stat-sub-title">⚡ 实际属性值</h4>
      <div class="stat-grid">
        <div v-for="(stat, index) in actualStatsList" :key="index" class="stat-item">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value actual-value-display">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="statPoints && statPoints.length" class="stat-sub-section">
      <h4 class="stat-sub-title">📈 属性点</h4>
      <div class="stat-grid">
        <div v-for="(statPoint, index) in statPoints" :key="index" class="stat-item">
          <span class="stat-label">{{ statPoint.label }}</span>
          <span class="stat-value">
            {{ statPoint.value }}
            <span v-if="getEquipmentBonus(statPoint.key) > 0" class="equipment-bonus">
              (+{{ getEquipmentBonus(statPoint.key) }})
            </span>
          </span>
          <div v-if="showAddPoint && freePoints > 0" class="stat-add">
            <button @click="() => addPoint(statPoint.key)">+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showFreePoints && freePoints > 0" class="free-points">
        🌟 可用属性点: {{ freePoints }}
      </div>

      <div v-if="showRestoreButtons" class="restore-buttons">
        <button class="game-btn" @click="restoreAll">{{ restoreButtonText }}</button>
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { STAT_CONFIG } from '../../stores/constants.js';
import { formatStat } from '../../stores/utils.js';
import { calculateEquipmentBonusPoints } from '../../stores/player.js';

const props = defineProps({
  basicInfo: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  expInfo: {
    type: Object,
    default: null,
  },
  actualStats: {
    type: Object,
    required: true,
  },
  statPoints: {
    type: Array,
    default: () => [],
  },
  freePoints: {
    type: Number,
    default: 0,
  },
  showAddPoint: {
    type: Boolean,
    default: true,
  },
  showRestoreButtons: {
    type: Boolean,
    default: true,
  },
  restoreButtonText: {
    type: String,
    default: "休息恢复生命和法力",
  },
  showFreePoints: {
    type: Boolean,
    default: true,
  },
  character: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['addPoint', 'restoreAll']);

// 计算装备加成的属性点
const equipmentBonusPoints = computed(() => {
  if (!props.character) {
    return {
      physicalAttack: 0,
      magicAttack: 0,
      defense: 0,
      speed: 0,
      maxHp: 0,
    };
  }
  return calculateEquipmentBonusPoints(props.character);
});

// 映射属性键到显示名称的key
const statKeyMapping = {
  '⚔️ 物攻点': 'physicalAttack',
  '✨ 法攻点': 'magicAttack',
  '🛡️ 防御点': 'defense',
  '💨 速度点': 'speed',
  '💖 生命点': 'maxHp',
};

const actualStatsList = computed(() => {
  const stats = props.actualStats;
  const list = [];
  
  if (props.character) {
    list.push({ 
      label: '❤️ 生命', 
      value: `${formatStat(props.character.hp)} / ${formatStat(stats.maxHp)}` 
    });
  } else if (stats.maxHp) {
    list.push({ label: '❤️ 生命', value: `0 / ${formatStat(stats.maxHp)}` });
  }
  
  if (props.character) {
    list.push({ 
      label: '💎 法力', 
      value: `${formatStat(props.character.mp)} / ${formatStat(stats.maxMp)}` 
    });
  } else if (stats.maxMp) {
    list.push({ label: '💎 法力', value: `0 / ${formatStat(stats.maxMp)}` });
  }
  
  if (stats.physicalAttack !== undefined) {
    list.push({ label: '⚔️ 物理攻击', value: formatStat(stats.physicalAttack) });
  }
  if (stats.magicAttack !== undefined) {
    list.push({ label: '✨ 法术攻击', value: formatStat(stats.magicAttack) });
  }
  if (stats.defense !== undefined) {
    list.push({ label: '🛡️ 防御', value: formatStat(stats.defense) });
  }
  if (stats.speed !== undefined) {
    list.push({ label: '💨 速度', value: formatStat(stats.speed) });
  }
  if (stats.critRate !== undefined) {
    list.push({ label: '💥 暴击率', value: `${formatStat(stats.critRate)}%` });
  }
  if (stats.comboRate !== undefined) {
    list.push({ label: '⚡ 连击率', value: `${formatStat(stats.comboRate)}%` });
  }
  if (stats.maxComboCount !== undefined) {
    list.push({ label: '🔄 最大连击', value: `${stats.maxComboCount || 1} 次` });
  }
  
  return list;
});

const addPoint = (key) => {
  emit('addPoint', key);
};

const restoreAll = () => {
  emit('restoreAll');
};

// 获取特定属性的装备加成
const getEquipmentBonus = (key) => {
  return equipmentBonusPoints.value[key] || 0;
};
</script>

<style scoped lang="scss">
.stat-panel {
  flex: 1;
  min-width: 350px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow: auto;
}

h3 {
  margin: 0 0 20px;
  color: white;
  font-size: 18px;
}

.basic-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row .label {
  color: #888;
}

.info-row .value {
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-row .value.active {
  color: #4ade80;
}

.toggle-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(74, 222, 128, 0.3);
  color: #4ade80;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: rgba(74, 222, 128, 0.5);
}

.exp-bar {
  margin-bottom: 24px;
}

.exp-label {
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

.exp-bar-bg {
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: width 0.3s;
}

.exp-text {
  text-align: right;
  color: #888;
  font-size: 12px;
  margin-top: 4px;
}

.stat-sub-section {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-sub-title {
  margin: 0 0 12px 0;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  padding-bottom: 8px;
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-label {
  color: #ccc;
  font-size: 14px;
}

.stat-value {
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.equipment-bonus {
  color: #4ade80;
  font-size: 14px;
  margin-left: 6px;
  opacity: 0.9;
}

.actual-value-display {
  color: #f59e0b;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

.stat-add button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-add button:hover {
  transform: scale(1.1);
}

.free-points {
  margin-top: 16px;
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #fbbf24;
  text-align: center;
  font-weight: 500;
}

.restore-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.game-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
</style>
