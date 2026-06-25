<template>
  <div class="enemy-list">
    <div class="enemy-list-header">附近敌人 ({{ aliveCount }})</div>
    <div class="enemy-list-body">
      <div
        v-for="(enemy, i) in aliveEnemies"
        :key="i"
        class="enemy-item"
        :class="'enemy-' + enemy.type"
      >
        <span class="enemy-type-icon">{{ getTypeIcon(enemy.type) }}</span>
        <span class="enemy-type-name">{{ getTypeName(enemy.type) }}</span>
        <div class="enemy-mini-hp">
          <div class="enemy-mini-hp-fill" :style="{ width: (enemy.hp / enemy.maxHp * 100) + '%' }"></div>
        </div>
      </div>
      <div v-if="aliveCount === 0" class="enemy-empty">暂无敌人</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ENEMY_TYPE_TABLE } from '../constants.js'

const props = defineProps({
  enemies: { type: Array, required: true },
})

const aliveEnemies = computed(() =>
  props.enemies.filter(e => !e.dead).slice(0, 5)
)

const aliveCount = computed(() =>
  props.enemies.filter(e => !e.dead).length
)

/** 从 ENEMY_TYPE_TABLE 构建 type → { icon, name } 查找表 */
const typeInfoMap = Object.fromEntries(
  ENEMY_TYPE_TABLE.map(({ type, attrs }) => [type, { icon: attrs.icon, name: attrs.name }])
)

const getTypeIcon = (type) => typeInfoMap[type]?.icon || '👾'

const getTypeName = (type) => typeInfoMap[type]?.name || type
</script>

<style scoped lang="scss">
.enemy-list {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  padding: 8px 10px;
  min-width: 160px;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
}

.enemy-list-header {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.enemy-list-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.enemy-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.enemy-type-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.enemy-type-name {
  width: 30px;
  color: #cbd5e1;
}

.enemy-mini-hp {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(15, 23, 42, 0.6);
  overflow: hidden;

  .enemy-mini-hp-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.2s;
  }
}

.enemy-melee .enemy-mini-hp-fill { background: #dc2626; }
.enemy-ranged .enemy-mini-hp-fill { background: #2563eb; }
.enemy-hybrid .enemy-mini-hp-fill { background: #7c3aed; }

.enemy-empty {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  padding: 4px 0;
}
</style>
