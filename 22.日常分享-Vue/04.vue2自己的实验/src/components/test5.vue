<template>
  <div class="box">
    <slot name="header"></slot>
    <slot name="content"></slot>
  </div>
</template>

<script>
  export default {
    name: "test5"
  }
</script>

<style scoped>
.box{
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0a800;
  margin-bottom: 10px;
}
</style>
