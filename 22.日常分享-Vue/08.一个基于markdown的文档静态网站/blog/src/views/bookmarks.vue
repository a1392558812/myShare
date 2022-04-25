<template>
  <div class="width100 height100 overflow-auto bookmarks" v-loading="str === ''">
    <div v-if="!ifDestroy" class="display-none html-str" v-html="str"></div>
    <div class="tips" >
      <span class="cursor-pointer" @click="spreadOut">{{`[${ifShowAll ? '关闭' : ''}全部展开]`}}</span>
    </div>
    <book-marks-item :data="htmlJson"></book-marks-item>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import axios from '@/common/axios.js'
import bookMarksItem from '@/components/bookmarks/item'
import { htmlToJson } from '@/common/methods'
import throttle from '@/common/util/throttle'

export default {
  name: 'bookmarks',
  components: {
    bookMarksItem
  },
  setup (props) {
    const str = ref('')
    const ifDestroy = ref(false)
    const ifShowAll = ref(false) // 是否展开全部
    const htmlJson = ref({})
    const spreadOutCallBack = (data) => {
      return new Promise(resolve => {
        (() => {
          if (![
            Object.prototype.hasOwnProperty.call(data, 'child'),
            Object.prototype.hasOwnProperty.call(data, 'ifShow'),
            Object.prototype.hasOwnProperty.call(data, 'ifRender')
          ].includes(false)) {
            data.ifRender = true
            data.ifShow = !ifShowAll.value
            data.child.forEach((item, index) => {
              spreadOutCallBack(data.child[index]).then()
            })
          }
        })()
        resolve('end')
      })
    }
    const spreadOut = () => throttle(() => {
      spreadOutCallBack(htmlJson.value).then(_ => {
        ifShowAll.value = !ifShowAll.value
      })
    }, 200)

    axios.get('./bookmarks.html').then(res => { str.value = res.data })

    watch(str, () => nextTick(() => {
      htmlJson.value = htmlToJson($('.html-str').children('dl').children('dt'), true, true)
      ifDestroy.value = true
    }))

    return {
      str,
      ifDestroy,
      htmlJson,
      ifShowAll,
      spreadOut
    }
  }
}
</script>

<style scoped lang="scss">
  .bookmarks{
    .tips{
      padding: 10px 5px;
      font-size: 16px;
      font-weight: bold;
    }
  }

</style>
