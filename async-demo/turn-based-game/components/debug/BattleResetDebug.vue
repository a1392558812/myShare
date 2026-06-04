<template>
  <div class="debug-section">
    <h4>⚡ 战斗测试</h4>
    <div class="debug-row">
      <button @click="props.setPlayerTurn">设为玩家回合</button>
      <button @click="props.setEnemyTurn">设为敌人回合</button>
    </div>
  </div>

  <div class="debug-section">
    <h4>⚠️ 重置</h4>
    <div class="debug-row">
      <button class="danger-btn" @click="props.confirmReset">重置游戏</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  setPlayerTurn: { type: Function, required: true },
  setEnemyTurn: { type: Function, required: true },
  confirmReset: { type: Function, required: true },
});
</script>
