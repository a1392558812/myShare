<template>
  <div id="page">
    <layout-header
      :ifLarger="ifLarger"
      @toggleMenu="toggleMenu"
      :headerH="headerH"/>
    <div class="content">
      <div class="content-inner relative">
        <layout-left-sidebar
          :leftSidebarW="leftSidebarW"
          :ifShowMenu="ifShowMenu"
          :ifLarger="ifLarger"
          @linkClick="linkClick"
          @itemClick="itemClick"/>
        <router-view
          :htmlMD="htmlMD"
          :title="title"
          :downloadName="downloadName"
          :type="type"/>
      </div>
    </div>
  </div>
</template>
<script>

import { ref, onBeforeMount } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

import layoutHeader from '@/components/header.vue'
import layoutLeftSidebar from '@/components/left-sidebar.vue'

import { typeCheck } from '@/common/methods'
import axios from '@/common/axios.js'

export default {
  components: {
    layoutHeader,
    layoutLeftSidebar
  },
  setup () {
    const htmlMD = ref('')
    const title = ref('ReadMe-前言')
    const type = ref('')
    const ifShowMenu = ref(false)
    const downloadName = ref('文件')
    const ifLarger = useBreakpoints(breakpointsTailwind).greater('sm')
    const leftSidebarW = ref('400px')
    if (!ifLarger) {
      leftSidebarW.value = '100vw'
    }
    onBeforeMount(() => {
      const urlLink = './README.md'
      axios.get(urlLink).then((response) => {
        htmlMD.value = response.data
        type.value = 'md'
      })
    })
    return {
      headerH: ref('70px'),
      leftSidebarW,
      ifLarger,
      ifShowMenu,
      htmlMD,
      title,
      type,
      downloadName,
      itemClick: (url) => {
        const urlSplitArr = url[url.length - 1].split('.')
        type.value = urlSplitArr[urlSplitArr.length - 1] ? urlSplitArr[urlSplitArr.length - 1] : ''
        const urlLink = `./${url.join('/')}`
        title.value = url.join(' > ')
        if (type.value === 'jpg' || type.value === 'png' || type.value === 'gif') {
          htmlMD.value = urlLink
          return
        }
        if (typeCheck(type.value)) {
          return axios.get(urlLink)
            .then((response) => {
              console.log('response', response)
              if (type.value === 'js') {
                htmlMD.value = '```js' + '\n' + response.data + '\n' + '```'
              } else if (type.value === 'ts') {
                htmlMD.value = '```typescript' + '\n' + response.data + '\n' + '```'
              } else if (type.value === 'html') {
                htmlMD.value = '```html' + '\n' + response.data + '\n' + '```'
              } else if (type.value === 'jsx') {
                htmlMD.value = '```jsx' + '\n' + response.data + '\n' + '```'
              } else {
                htmlMD.value = response.data
              }
            }).catch(_ => {
              htmlMD.value = ''
            })
        }
        downloadName.value = url[url.length - 1]
        console.log('url', url)
        htmlMD.value = urlLink
      },
      linkClick: (url) => {
        window.open(url)
        console.log('url', url)
      },
      toggleMenu: () => { // 切换菜单状态
        ifShowMenu.value = !ifShowMenu.value
      }
    }
  }
}
</script>

<style lang="scss">
#page{
  height: 100vh;
  position: relative;
  .content{
    height: calc(100vh - v-bind(headerH));
    padding-top: v-bind(headerH);
    .content-inner{
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
    }
  }
}
</style>
