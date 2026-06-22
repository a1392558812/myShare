<template>
  <div class="sidebar-card">
    <span class="card-rivet rivet-tl"></span>
    <span class="card-rivet rivet-tr"></span>
    <h3 class="sidebar-title">
      <span class="sidebar-title-icon">&#8986;</span> 推荐阅读
    </h3>
    <div class="recommend-list">
      <a v-for="item in articles" :key="item.id" href="#" class="recommend-item">
        <span class="recommend-index" :style="{ color: item.accent }">
          {{ String(item.id).padStart(2, '0') }}
        </span>
        <span class="recommend-title">{{ item.title }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  articles: { type: Array, required: true }
})
</script>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;
$steampunk-brass-light: #e0c88e;
$bili-pink: #FB7299;
$border-color: rgba(201, 169, 110, 0.25);
$text-secondary: #b8a99a;

.sidebar-card {
  position: relative;
  background: #241f2d;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 20px 24px;
  transition: border-color 0.4s ease;

  &:hover {
    border-color: $steampunk-brass;
  }
}

.card-rivet {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 35% 35%, #e0c88e, #a08040);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(201, 169, 110, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2);

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.3);
  }
}

.rivet-tl {
  top: 8px;
  left: 8px;
}

.rivet-tr {
  top: 8px;
  right: 8px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: $steampunk-brass-light;

  .sidebar-title-icon {
    font-size: 16px;
  }
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(42, 36, 51, 0.6);

    .recommend-title {
      color: $bili-pink;
    }
  }
}

.recommend-index {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.recommend-title {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.4;
  transition: color 0.3s ease;
}
</style>
