<template>
  <div style="display: flex; align-items: center; gap: 5px;">
    <input :type="type" :style="[{ width: '50px' }, inputStyle]" v-model="value" />
    <button :style="btnStyle" @click="onClick">{{ btnText }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  btnText:{
    type: String,
    default: '确定',
  },
  inputStyle: {
    type: Object,
    default: () => ({}),
  },
  btnStyle: {
    type: Object,
    default: () => ({}),
  },
  
})

const value = ref(props.modelValue)

const onClick = () => {
  emit('update:modelValue', value.value)
}
</script>