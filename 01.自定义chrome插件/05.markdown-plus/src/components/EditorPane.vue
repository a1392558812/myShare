<template>
  <textarea ref="textareaElement" class="editor" :value="modelValue" placeholder="请输入内容" spellcheck="false"
    autocomplete="off" autocapitalize="off" @input="handleInput" @keydown.tab.prevent="insertIndent"></textarea>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const textareaElement = ref<HTMLTextAreaElement | null>(null)

const handleInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const insertIndent = (): void => {
  const element = textareaElement.value
  if (!element) {
    return
  }
  const insertedByCommand = document.execCommand('insertText', false, '  ')
  if (insertedByCommand) {
    return
  }
  element.setRangeText('  ', element.selectionStart, element.selectionEnd, 'end')
  emit('update:modelValue', element.value)
}
</script>

<style lang="scss" scoped>
.editor {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 18px 20px 60px;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.8;
  tab-size: 2;

  &::placeholder {
    color: var(--text-soft);
  }
}
</style>
