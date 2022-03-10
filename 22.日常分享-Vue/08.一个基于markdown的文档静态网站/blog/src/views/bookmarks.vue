<template>
  <div class="width100 height100 overflow-auto bookmarks" v-loading="str === ''">
    <div class="html-str" v-html="str"></div>
  </div>
</template>

<script>
import axios from '@/common/axios.js'
import { ref } from 'vue'
export default {
  name: 'bookmarks',
  setup (props) {
    const str = ref('')
    axios.get('./bookmarks.html').then(res => {
      str.value = res.data
    })
    return {
      str
    }
  }
}
</script>

<style scoped lang="scss">
  .bookmarks{
    ::v-deep(h1) {
      font-size: 25px;
      padding: 5px 0;
      font-weight: bold;
    }
    ::v-deep(h3) {
      font-size: 20px;
      padding: 5px 0;
      color: #00aa88;
      font-weight: bold;
    }
    ::v-deep(dt) {
      margin-left: 15px;
      padding: 10px 0;
    }
    ::v-deep(dl) {
      margin-left: 15px;
    }
    ::v-deep(a) {
      display: inline;
      font-size: 16px;
    }
  }
</style>
