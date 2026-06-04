<template>
  <div class="skill-panel">
    <h3>📚 技能</h3>
    
    <div class="skill-list">
      <div v-for="skill in skills" :key="skill.id" class="skill-card">
        <div class="skill-name">{{ skill.name }}</div>
        <div class="skill-type">
          {{ skill.type === 'magic' ? '法术' : '物理' }}
        </div>
        <div class="skill-cost">消耗: {{ skill.cost }} MP</div>
        <div class="skill-desc">{{ skill.description }}</div>
      </div>
    </div>
    
    <div v-if="!skills || skills.length === 0" class="empty-tip">
      {{ emptyTip }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  skills: {
    type: Array,
    default: () => [],
  },
  emptyTip: {
    type: String,
    default: '暂无技能，让角色学会更多技能吧！',
  },
});
</script>

<style scoped lang="scss">
.skill-panel {
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

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  padding: 16px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
}

.skill-name {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
}

.skill-type {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(168, 85, 247, 0.3);
  border-radius: 4px;
  color: #c084fc;
  font-size: 12px;
  margin-bottom: 6px;
}

.skill-cost {
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
}

.skill-desc {
  color: #aaa;
  font-size: 13px;
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 40px 20px;
}
</style>
