<template>
  <section class="skill-set">
    <h2 class="section-title">技能特长</h2>

    <div v-for="(group, gIdx) in skillGroups" :key="gIdx" class="group">
      <h3 class="group-title">{{ group.category }}</h3>
      <div class="skill-rows">
        <div v-for="(skill, sIdx) in group.skills" :key="sIdx" class="skill-row">
          <span class="skill-name">{{ skill.name }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: skill.level + '%' }"></div>
          </div>
          <span class="level-text">{{ skill.level }}%</span>
        </div>
      </div>
    </div>

    <div v-if="tags.length" class="tag-section">
      <h3 class="group-title">其他了解</h3>
      <div class="tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  skillGroups: {
    type: Array,
    default: () => [],
  },
  tags: {
    type: Array,
    default: () => ['CSS / SCSS', 'Canvas / SVG', '微信小程序', 'Docker 基础', 'Python 脚本', 'Linux 命令行', 'Figma', 'MongoDB'],
  },
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.skill-set {
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #35495e;
  margin: 0 0 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b883;
  display: inline-block;
}

.group {
  margin-bottom: 18px;
}

.group-title {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
}

.skill-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-name {
  width: 180px;
  font-size: 13px;
  color: #334155;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35495e);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.level-text {
  width: 34px;
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
  flex-shrink: 0;
}

.tag-section {
  margin-top: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  font-size: 12px;
  color: #166534;
}
</style>
