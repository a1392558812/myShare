<template>
  <section class="work-experience">
    <h2 class="section-title">传奇经历</h2>
    <div class="timeline">
      <div v-for="(job, idx) in jobs" :key="idx" class="timeline-item">
        <div class="dot"></div>

        <div class="card">
          <div class="card-header">
            <div class="left">
              <span class="company">{{ job.company }}</span>
              <span class="position">{{ job.position }}</span>
            </div>
            <span class="period">{{ job.period }}</span>
          </div>
          <ul class="desc-list">
            <li v-for="(desc, dIdx) in job.descriptions" :key="dIdx">{{ desc }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  jobs: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.work-experience {
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

.timeline {
  position: relative;
  padding-left: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #e2e8f0;
    border-radius: 1px;
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.dot {
  position: absolute;
  left: -21px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #42b883;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #42b883;
}

.card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.company {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.position {
  font-size: 12px;
  color: #42b883;
  font-weight: 500;
}

.period {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.desc-list {
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
