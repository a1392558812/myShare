<template>
  <div class="debug-section">
    <h4>💰 金币</h4>
    <div class="debug-row">
      <input type="number" v-model.number="goldAmount" placeholder="金币数量" />
      <button @click="addGold">添加金币</button>
    </div>
    <div class="debug-info">当前金币: {{ gameState.player.gold }}</div>
  </div>

  <div class="debug-section">
    <h4>📈 属性点</h4>
    <div class="debug-row">
      <select v-model="selectedStat">
        <option value="physicalAttack">物攻点</option>
        <option value="magicAttack">法攻点</option>
        <option value="defense">防御点</option>
        <option value="speed">速度点</option>
        <option value="maxHp">生命点</option>
        <option value="critRate">暴击率</option>
        <option value="comboRate">连击率</option>
        <option value="maxComboCount">最大连击数</option>
      </select>
      <input type="number" v-model.number="statAmount" placeholder="数量" />
      <button @click="addStatPoints">添加属性点</button>
    </div>
    <div class="debug-info">自由属性点: {{ gameState.player.freePoints }}</div>
    <div class="debug-info">注意：法力上限通过法攻点自动增加</div>
  </div>

  <div class="debug-section">
    <h4>⭐ 经验</h4>
    <div class="debug-row">
      <input type="number" v-model.number="expAmount" placeholder="经验值" />
      <button @click="addExp">添加经验</button>
    </div>
    <div class="debug-info">
      等级: {{ gameState.player.level }} | 经验: {{ gameState.player.exp }}/{{
        gameState.player.expToNext
      }}
    </div>
  </div>

  <div class="debug-section">
    <h4>❤️ 生命</h4>
    <div class="debug-row">
      <input type="number" v-model.number="hpAmount" placeholder="生命值" />
      <button @click="addHp">恢复生命</button>
      <button @click="fillHp">回满血</button>
    </div>
    <div class="debug-info">
      HP: {{ gameState.player.hp }}/{{ gameState.player.maxHp }}
    </div>
  </div>

  <div class="debug-section">
    <h4>💎 法力</h4>
    <div class="debug-row">
      <input type="number" v-model.number="mpAmount" placeholder="法力值" />
      <button @click="addMp">恢复法力</button>
      <button @click="fillMp">回满蓝</button>
    </div>
    <div class="debug-info">
      MP: {{ gameState.player.mp }}/{{ gameState.player.maxMp }}
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";
const goldAmount = defineModel("goldAmount");
const statAmount = defineModel("statAmount");
const selectedStat = defineModel("selectedStat");
const expAmount = defineModel("expAmount");
const hpAmount = defineModel("hpAmount");
const mpAmount = defineModel("mpAmount");

const props = defineProps({
  addGold: { type: Function, required: true },
  addStatPoints: { type: Function, required: true },
  addExp: { type: Function, required: true },
  addHp: { type: Function, required: true },
  fillHp: { type: Function, required: true },
  addMp: { type: Function, required: true },
  fillMp: { type: Function, required: true },
});
</script>
