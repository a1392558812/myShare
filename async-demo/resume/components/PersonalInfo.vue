<template>
  <section class="personal-info">
    <div class="avatar-wrap">
      <div class="avatar">{{ avatarLetter }}</div>
    </div>

    <div class="info-body">
      <h1 class="name">{{ info.name }}</h1>
      <p class="title">{{ info.title }}</p>

      <ul class="contact-list">
        <li v-for="item in info.contacts" :key="item.label" class="contact-item">
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.label }}: {{ item.value }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
})

const avatarLetter = computed(() => props.info.name?.charAt(0).toUpperCase() || 'A')
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.personal-info {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 36px 40px;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  border-radius: 12px 12px 0 0;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 3px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  user-select: none;
}

.info-body {
  color: #fff;
}

.name {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
}

.title {
  margin: 0 0 16px;
  font-size: 14px;
  opacity: 0.85;
  letter-spacing: 2px;
}

.contact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.icon {
  font-size: 14px;
}

.text {
  color: rgba(255, 255, 255, 0.95);
}
</style>
