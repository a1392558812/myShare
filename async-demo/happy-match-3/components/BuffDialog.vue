<template>
  <div class="mask">
    <div class="panel">
      <div class="title">第 {{ stage - 1 }} 层达成</div>
      <div class="sub">选一个强化带进第 {{ stage }} 层</div>

      <div class="cards">
        <button
          v-for="b in options"
          :key="b.id"
          class="card"
          @click="$emit('pick', b.id)"
        >
          <span class="icon">{{ b.icon }}</span>
          <span class="name">{{ b.name }}</span>
          <span class="desc">{{ b.desc }}</span>
          <span v-if="b.stack" class="stack">已持有 {{ b.stack }} / {{ b.max }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  stage: { type: Number, required: true },
})
defineEmits(['pick'])
</script>

<style scoped lang="scss">
.mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 4, 16, .74);
  backdrop-filter: blur(4px);
}

.panel {
  width: 560px;
  padding: 26px 28px 24px;
  text-align: center;
  background: linear-gradient(170deg, #33205a, #1a1030);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .55);
  animation: pop .28s cubic-bezier(.2, 1.4, .4, 1);
}

@keyframes pop {
  from { transform: scale(.86); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #ffd93d;
  text-shadow: 0 0 18px rgba(255, 217, 61, .35);
}

.sub { margin-top: 6px; font-size: 13px; color: rgba(255, 255, 255, .5); }

.cards { display: flex; gap: 12px; margin-top: 20px; }

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 18px 12px 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 16px;
  transition: transform .14s, background .18s, border-color .18s;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, .13);
    border-color: rgba(255, 217, 61, .55);
  }

  &:active { transform: translateY(-1px); }
}

.icon { font-size: 30px; line-height: 1; }

.name { font-size: 15px; font-weight: 700; color: #fff; }

.desc {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, .6);
}

.stack { font-size: 11px; color: #ffd93d; }
</style>
