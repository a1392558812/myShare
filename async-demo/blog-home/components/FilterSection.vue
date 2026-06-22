<template>
  <div class="filter-section">
    <div class="section-label">
      <span class="label-rivet rivet-tl"></span>
      <span class="label-rivet rivet-tr"></span>
      <span class="label-rivet rivet-bl"></span>
      <span class="label-rivet rivet-br"></span>
      <span class="label-icon">&#9881;</span> 文章分类
    </div>
    <div class="filter-tags">
      <button v-for="tag in tags" :key="tag" :class="['filter-tag', { active: modelValue === tag }]"
        @click="emit('update:modelValue', tag)">
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tags: { type: Array, required: true },
  modelValue: { type: String, default: '全部' }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
$bili-pink: #FB7299;
$steampunk-brass: #c9a96e;
$steampunk-brass-light: #e0c88e;
$text-secondary: #b8a99a;

.filter-section {
  margin-bottom: 28px;
}

.section-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: $steampunk-brass-light;
  background: rgba(201, 169, 110, 0.06);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 4px;

  .label-icon {
    font-size: 16px;
  }
}

.label-rivet {
  position: absolute;
  width: 6px;
  height: 6px;
  background: $steampunk-brass;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(201, 169, 110, 0.6);
}

.rivet-tl {
  top: -3px;
  left: -3px;
}

.rivet-tr {
  top: -3px;
  right: -3px;
}

.rivet-bl {
  bottom: -3px;
  left: -3px;
}

.rivet-br {
  bottom: -3px;
  right: -3px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  padding: 6px 16px;
  font-size: 13px;
  color: $text-secondary;
  background: rgba(42, 36, 51, 0.5);
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: $steampunk-brass-light;
    background: rgba(201, 169, 110, 0.08);
  }

  &.active {
    color: #fff;
    background: $bili-pink;
    border-color: $bili-pink;
    box-shadow: 0 2px 12px rgba(251, 114, 153, 0.3);
  }
}
</style>
