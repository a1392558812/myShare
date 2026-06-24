<template>
  <div class="resume-page">
    <div class="resume-container">
      <PersonalInfo :info="personalInfo" />
      <div class="resume-body">
        <div class="col-main">
          <div class="section-wrap">
            <WorkExperience :jobs="jobs" />
          </div>
          <div class="section-wrap">
            <ProjectExperience :projects="projects" />
          </div>
        </div>

        <div class="col-aside">
          <div class="section-wrap">
            <SkillSet :skillGroups="skillGroups" :tags="tags" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PersonalInfo from './components/PersonalInfo.vue'
import WorkExperience from './components/WorkExperience.vue'
import SkillSet from './components/SkillSet.vue'
import ProjectExperience from './components/ProjectExperience.vue'

const messCode = (len = 30) => {
  let res = '';
  for (let i = 0; i < len; i++) {
    const type = Math.random();
    if (type < 0.3) {
      const c = '!@#$%^&a-zA-Z0-9';
      res += c[Math.floor(Math.random() * c.length)];
    } else if (type < 0.6) {
      const code = Math.floor(Math.random() * (0x9fa5 - 0x4e00)) + 0x4e00;
      res += String.fromCharCode(code);
    } else {
      const code = Math.floor(Math.random() * 1000) + 100;
      res += String.fromCharCode(code);
    }
  }
  return res;
}

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const randomNumber = (digit) => {
  if (digit <= 0) return 0;
  let res = Math.floor(Math.random() * 9) + 1;
  for (let i = 1; i < digit; i++) {
    res = res * 10 + Math.floor(Math.random() * 10);
  }
  return res;
}

const personalInfo = {
  name: 'Awen',
  title: 'MC-机械动力资深玩家(水车仙人)',
  contacts: [
    { icon: '📧', label: '邮箱', value: messCode(10) },
    { icon: '📱', label: '手机', value: `${randomNumber(3)}-${randomNumber(4)}-${randomNumber(4)}` },
    { icon: '📍', label: '城市', value: messCode(2) },
    { icon: '🔗', label: 'GitHub', value: `https://github.com/a1392558812` },
  ],
}

const jobs = Array.from({ length: 10 }).map((_, index) => {
  return {
    company: messCode(8),
    position: messCode(6),
    period: `神龙元年 — 天启${randomNumber(random(1, 2))}年`,
    descriptions: Array.from({ length: random(3, 5) }).map(() => messCode(74, 150)),
  }
})

const projects = Array.from({ length: 10 }).map((_, index) => {
  return {
    name: messCode(8),
    period: `神龙元年 — 天启${randomNumber(random(1, 2))}年`,
    stack: Array.from({ length: random(5, 7) }).map(() => messCode(4, 10)),
    highlights: Array.from({ length: random(3, 5) }).map(() => messCode(84, 170)),
  }
})

const skillGroups = Array.from({ length: 3 }).map((_, index) => {
  return {
    category: `技能Skill-${index + 1}`,
    skills: Array.from({ length: random(4, 7) }).map(() => {
      return { name: `${messCode(random(3, 5))} / ${messCode(random(3, 5))}`, level: random(55, 92) }
    }),
  }
})

const tags = Array.from({ length: 10 }).map((_, index) => {
  return `${messCode(random(4, 11))}`
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.resume-page {
  min-height: 100vh;
  background: #555555;
  padding: 32px 16px;
  box-sizing: border-box;
}

.resume-container {
  width: 100%;
  width: 960px;
  flex-shrink: 0;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.resume-body {
  display: flex;
  gap: 0;
  padding: 28px 32px;
  box-sizing: border-box;
}

.col-main {
  flex: 1 1 0;
  min-width: 0;
  padding-right: 28px;
  border-right: 1px solid #e2e8f0;
}

.col-aside {
  width: 280px;
  flex-shrink: 0;
  padding-left: 28px;
}

.section-wrap {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
