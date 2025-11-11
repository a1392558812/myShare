<template>
  <div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
// Example of correct Vue 3 dynamic CSS binding
.some-element {
  perspective: v-bind('`${perspective}px`');
}
</style>
