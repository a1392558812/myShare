<template>
  <div class="start">
    <div class="board">
      <h1 class="title">日麻· 双人对战</h1>

      <div class="block">
        <div class="label">局制</div>
        <div class="opts">
          <button v-for="m in MATCH_LENGTH" :key="m.key" class="opt" :class="{ on: length === m.key }"
            @click="length = m.key">
            <div>{{ m.name }}</div>
            <div style="font-size: 12px;">{{ m.desc }}</div>
          </button>
        </div>
      </div>

      <div class="block">
        <div class="label">难度</div>
        <div class="opts">
          <button v-for="d in DIFFICULTY" :key="d.key" class="opt" :class="{ on: difficulty === d.key }"
            @click="difficulty = d.key">
            {{ d.name }}
          </button>
        </div>
      </div>

      <div class="block">
        <div class="opts">
          <button class="opt" @click="$emit('start', { difficulty, length })">开始对局</button>
          <button class="opt" @click="$emit('rules')">规则手册</button>
          <button class="opt" @click="$emit('docs')">需求文档</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DIFFICULTY, MATCH_LENGTH, STORAGE_KEY } from '../constants.js'

defineEmits(['docs', 'rules'])

const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch (e) { return {} }
})()
const difficulty = ref(saved.difficulty || 'normal')
const length = ref(saved.length || 'south')
</script>

<style scoped lang="scss">
.start {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #082c22;

  .board {
    width: 620px;
    max-height: 100%;
    overflow-y: auto;
    padding: 34px 40px;
    background: rgba(0, 0, 0, .3);
    border: 1px solid #fff;

    .title {
      font-size: 30px;
      color: #fff;
      text-align: center;
    }

    .block {
      margin-top: 26px;

      .label {
        margin-bottom: 10px;
        font-size: 12px;
        color: rgba(242, 239, 230, .5);
      }

      .opts {
        display: flex;
        gap: 10px;

        .opt {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 10px;
          text-align: left;
          cursor: pointer;
          background: rgba(255, 255, 255, .05);
          border: 1px solid rgba(255, 217, 61, 0);
          font-size: 14px;
          color: #f2efe6;
          text-align: center;

          &:hover {
            border: 1px solid #fff;
          }

          &.on {
            border: 1px solid rgba(255, 217, 61, 1);
          }
        }
      }
    }
  }
}
</style>
