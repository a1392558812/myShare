<template>
  <div class="debug-section">
    <h4>🎯 动态属性调整</h4>

    <div class="coeff-section">
      <h5>🧙 玩家属性</h5>
      <div class="debug-row">
        <label>当前HP</label>
        <input
          type="number"
          v-model.number="playerHp"
          :min="0"
          :max="gameState.player.maxHp"
        />
        <button @click="setPlayerHp">设置HP</button>
      </div>
      <div class="debug-row">
        <label>当前MP</label>
        <input
          type="number"
          v-model.number="playerMp"
          :min="0"
          :max="gameState.player.maxMp"
        />
        <button @click="setPlayerMp">设置MP</button>
      </div>
      <div class="debug-info">
        玩家: HP {{ gameState.player.hp }}/{{ gameState.player.maxHp }} | MP
        {{ gameState.player.mp }}/{{ gameState.player.maxMp }}
      </div>
    </div>

    <div class="coeff-section" v-if="gameState.pet">
      <h5>🐾 宠物属性</h5>
      <div class="debug-row">
        <label>当前HP</label>
        <input
          type="number"
          v-model.number="petHp"
          :min="0"
          :max="gameState.pet.maxHp"
        />
        <button @click="setPetHp">设置HP</button>
      </div>
      <div class="debug-row">
        <label>当前MP</label>
        <input
          type="number"
          v-model.number="petMp"
          :min="0"
          :max="gameState.pet.maxMp"
        />
        <button @click="setPetMp">设置MP</button>
      </div>
      <div class="debug-info">
        宠物: HP {{ gameState.pet.hp }}/{{ gameState.pet.maxHp }} | MP
        {{ gameState.pet.mp }}/{{ gameState.pet.maxMp }}
      </div>
    </div>

    <div class="coeff-section">
      <h5>⚔️ 战斗属性 (临时调整)</h5>
      <div class="debug-info info-note">
        注意:
        以下属性仅用于测试，通过基础属性计算获得，直接修改基础属性点以永久改变属性
      </div>
      <div class="debug-row">
        <label>目标角色</label>
        <select v-model="targetRole">
          <option value="player">玩家</option>
          <option value="pet" v-if="gameState.pet">宠物</option>
        </select>
      </div>
      <div class="debug-row">
        <label>物理攻击</label>
        <input type="number" v-model.number="tempPhysicalAttack" :min="0" />
        <button @click="applyTempStats">临时应用</button>
        <button @click="resetTempStats">重置</button>
      </div>
      <div class="debug-row">
        <label>法术攻击</label>
        <input type="number" v-model.number="tempMagicAttack" :min="0" />
      </div>
      <div class="debug-row">
        <label>防御</label>
        <input type="number" v-model.number="tempDefense" :min="0" />
      </div>
      <div class="debug-row">
        <label>速度</label>
        <input type="number" v-model.number="tempSpeed" :min="0" />
      </div>
      <div class="debug-info">
        {{ targetRole === "player" ? "玩家" : "宠物" }}: 物攻
        {{ currentStats.physicalAttack }} | 法攻
        {{ currentStats.magicAttack }} | 防御 {{ currentStats.defense }} | 速度
        {{ currentStats.speed }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { gameState } from "../../stores/gameStore.js";
import {
  calculatePlayerStats,
  calculatePetStats,
} from "../../stores/player.js";

const targetRole = ref("player");
const playerHp = ref(0);
const playerMp = ref(0);
const petHp = ref(0);
const petMp = ref(0);
const tempPhysicalAttack = ref(0);
const tempMagicAttack = ref(0);
const tempDefense = ref(0);
const tempSpeed = ref(0);

// 初始化时读取当前值
onMounted(() => {
  if (gameState.player) {
    playerHp.value = gameState.player.hp;
    playerMp.value = gameState.player.mp;
  }
  if (gameState.pet) {
    petHp.value = gameState.pet.hp;
    petMp.value = gameState.pet.mp;
  }
});

// 监听 gameState 变化，更新输入框的值
watch(
  () => [gameState.player?.hp, gameState.player?.mp],
  ([newHp, newMp]) => {
    playerHp.value = newHp ?? 0;
    playerMp.value = newMp ?? 0;
  },
);

watch(
  () => [gameState.pet?.hp, gameState.pet?.mp],
  ([newHp, newMp]) => {
    petHp.value = newHp ?? 0;
    petMp.value = newMp ?? 0;
  },
);

const setPlayerHp = () => {
  if (playerHp.value < 0) playerHp.value = 0;
  if (playerHp.value > gameState.player.maxHp)
    playerHp.value = gameState.player.maxHp;
  gameState.player.hp = playerHp.value;
};

const setPlayerMp = () => {
  if (playerMp.value < 0) playerMp.value = 0;
  if (playerMp.value > gameState.player.maxMp)
    playerMp.value = gameState.player.maxMp;
  gameState.player.mp = playerMp.value;
};

const setPetHp = () => {
  if (!gameState.pet) return;
  if (petHp.value < 0) petHp.value = 0;
  if (petHp.value > gameState.pet.maxHp) petHp.value = gameState.pet.maxHp;
  gameState.pet.hp = petHp.value;
};

const setPetMp = () => {
  if (!gameState.pet) return;
  if (petMp.value < 0) petMp.value = 0;
  if (petMp.value > gameState.pet.maxMp) petMp.value = gameState.pet.maxMp;
  gameState.pet.mp = petMp.value;
};

const currentStats = computed(() => {
  if (targetRole.value === "player") {
    return calculatePlayerStats(gameState.player);
  } else if (gameState.pet) {
    return calculatePetStats(gameState.pet);
  }
  return { physicalAttack: 0, magicAttack: 0, defense: 0, speed: 0 };
});

const applyTempStats = () => {
  if (targetRole.value === "player") {
    gameState.player.tempPhysicalAttack = tempPhysicalAttack.value;
    gameState.player.tempMagicAttack = tempMagicAttack.value;
    gameState.player.tempDefense = tempDefense.value;
    gameState.player.tempSpeed = tempSpeed.value;
  } else if (gameState.pet) {
    gameState.pet.tempPhysicalAttack = tempPhysicalAttack.value;
    gameState.pet.tempMagicAttack = tempMagicAttack.value;
    gameState.pet.tempDefense = tempDefense.value;
    gameState.pet.tempSpeed = tempSpeed.value;
  }
};

const resetTempStats = () => {
  tempPhysicalAttack.value = 0;
  tempMagicAttack.value = 0;
  tempDefense.value = 0;
  tempSpeed.value = 0;
  if (targetRole.value === "player") {
    delete gameState.player.tempPhysicalAttack;
    delete gameState.player.tempMagicAttack;
    delete gameState.player.tempDefense;
    delete gameState.player.tempSpeed;
  } else if (gameState.pet) {
    delete gameState.pet.tempPhysicalAttack;
    delete gameState.pet.tempMagicAttack;
    delete gameState.pet.tempDefense;
    delete gameState.pet.tempSpeed;
  }
};
</script>

<style scoped lang="scss"></style>
