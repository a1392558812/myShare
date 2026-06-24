<template>
  <section class="project-experience">
    <h2 class="section-title">项目经验</h2>

    <div v-for="(proj, idx) in projects" :key="idx" class="proj-card">
      <div class="proj-header">
        <span class="proj-name">{{ proj.name }}</span>
        <span class="proj-period">{{ proj.period }}</span>
      </div>

      <div class="tech-stack">
        <span v-for="tech in proj.stack" :key="tech" class="tech-tag">{{ tech }}</span>
      </div>

      <ul class="proj-desc">
        <li v-for="(line, lIdx) in proj.highlights" :key="lIdx">{{ line }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.project-experience {
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

.proj-card {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #42b883;
  border-radius: 0 8px 8px 0;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

.proj-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}

.proj-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.proj-period {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tech-tag {
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 11px;
  color: #475569;
}

.proj-desc {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
  }
}
</style>
