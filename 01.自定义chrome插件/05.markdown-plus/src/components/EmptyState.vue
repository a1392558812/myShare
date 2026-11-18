<template>
  <div class="empty">
    <svg class="empty__icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="10" y="8" width="44" height="48" rx="8" fill="#eef2ff" stroke="#c7d2fe" stroke-width="2" />
      <path d="M20 22h24M20 30h18M20 38h14" stroke="#6366f1" stroke-width="3" stroke-linecap="round" />
      <circle cx="46" cy="46" r="12" fill="#2563eb" />
      <path d="M46 40v10M41.5 45.5 46 50l4.5-4.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>
    <h1>拖入 Markdown 文件开始</h1>
    <p class="empty__lead">把 <code>.md</code> 文件从文件管理器拖进这个窗口，即可预览、编辑并保存。</p>
    <div class="empty__actions">
      <button class="btn btn--primary" type="button" @click="$emit('open')">打开文件</button>
      <button class="btn" type="button" @click="$emit('create')">新建空白</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (event: 'open'): void
  (event: 'create'): void
}>()
</script>

<style lang="scss" scoped>
@use '../styles/button';

.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 32px;
  text-align: center;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08), transparent 62%),
    var(--surface);

  h1 {
    margin: 6px 0 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
}

.empty__icon {
  width: 64px;
  height: 64px;
}

.empty__lead {
  margin: 0;
  max-width: 460px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);

  code {
    padding: 1px 5px;
    border-radius: 5px;
    background: var(--surface-muted);
    font-family: var(--font-mono);
    font-size: 12px;
  }
}

.empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}
</style>
