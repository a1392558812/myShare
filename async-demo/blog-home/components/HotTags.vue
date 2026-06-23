<template>
  <div class="sidebar-card">
    <span class="card-rivet rivet-tl"></span>
    <span class="card-rivet rivet-tr"></span>
    <h3 class="sidebar-title">
      <span class="sidebar-title-icon">&#9881;</span> 热门标签
    </h3>
    <div class="tag-cloud">
      <a v-for="tag in tags" :key="tag.name" href="#" class="tag-cloud-item"
        :style="{ fontSize: tag.size + 'px', opacity: tag.opacity }">{{ tag.name }}</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tags: { type: Array, required: true }
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-cloud-item {
  padding: 4px 12px;
  color: $text-secondary;
  background: rgba(42, 36, 51, 0.6);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 3px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    color: $bili-pink;
    border-color: $bili-pink;
    background: rgba(251, 114, 153, 0.08);
  }
}
</style>
