<template>
  <div class="battle-log">
    <div class="log-header">战斗日志</div>
    <div class="log-content" ref="logContentRef">
      <p
        v-for="(log, index) in battleLog"
        :key="index"
        :class="{ latest: index === battleLog.length - 1 }"
      >
        {{ log }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  battleLog: { type: Array, required: true },
});

const logContentRef = ref(null);

watch(
  () => props.battleLog.length,
  () => {
    nextTick(() => {
      if (logContentRef.value) {
        logContentRef.value.scrollTop = logContentRef.value.scrollHeight;
      }
    });
  },
);

defineExpose({ logContentRef });
</script>

<style scoped lang="scss">
.battle-log {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;

  .log-header {
    padding: 10px 16px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
    color: #888;
    font-size: 14px;
  }

  .log-content {
    flex: 1;
    min-height: 120px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 12px 16px;

    p {
      margin: 0 0 8px;
      color: #ccc;
      font-size: 14px;

      &.latest {
        color: #fff;
        font-weight: 500;
      }
    }
  }
}
</style>
