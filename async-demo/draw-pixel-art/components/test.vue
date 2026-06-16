<template>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <div>
      <inputBtn v-model="inputVal0" />
      <div>{{ inputVal0 }}</div>
      <button @click="inputVal0 = 'xxx'">set inputVal0 = xxx</button>
    </div>

    <div>
      <inputBtn type="number" v-model.number="inputVal1" :min="-100" :max="100" :step="0.1" />
      <div>{{ inputVal1 }}</div>
      <button @click="inputVal1 = 50">set inputVal0 = 50</button>
    </div>

    <div>
      <inputBtn type="range" v-model.number="inputVal2" :min="-110" :max="110" :step="0.1" />
      <div>{{ inputVal2 }}</div>
      <button @click="inputVal2 = 50">set inputVal2 = 50</button>
    </div>

    <div>
      <inputBtn type="checkbox" v-model="inputVal3" />
      <div>{{ inputVal3 }}</div>
      <button @click="inputVal3 = !inputVal3">set inputVal3 = {{ !inputVal3 }}</button>
    </div>

    <div>
      <inputBtn type="file" accept="image/*" v-model="inputVal4" />
      <div>{{ inputVal4 }}</div>
    </div>

    <div>
      <inputBtn type="color" v-model="inputVal5" />
      <div>{{ inputVal5 }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue"

import inputBtn from "../../components/input-btn/index.vue";

const inputVal0 = ref('inputVal')
const inputVal1 = ref(99)
const inputVal2 = ref(99)
const inputVal3 = ref(true)
const inputVal4 = ref(null)
const inputVal5 = ref('rgba(235,10,10,0.81)')
</script>