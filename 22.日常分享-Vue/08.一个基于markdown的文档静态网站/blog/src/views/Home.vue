<template>
  <div class="content-inner overflow-hidden width100 height100 flex flex-direction-row">
    <layout-left-sidebar
      :leftSidebarW="leftSidebarW"
      :ifShowMenu="ifShowMenu"
      :ifLarger="ifLarger"
      :headerH="headerH"
      :toggleMenu="toggleMenu"
      @linkClick="linkClick"
      @itemClick="itemClick"/>
    <div
      :style="ifLarger ? {width: `calc(100% - ${leftSidebarW})`} : {width: '100%'}"
      class="relative height100">
      <!-- 背景图 -->
      <div class="bg-image width100 height100 absolute"></div>
      <div class="home relative width100 height100">
        <!-- 标题 -->
        <div
          v-if="!markdownType"
          class="title width100 flex align-items-center justify-content-center">{{ title }}</div>
        <!-- md格式 -->
        <markdown-type
          v-if="markdownType"
          :title="title"
          :markdownTitleWidth="markdownTitleWidth"
          :loading="loading"
          :ifLarger="ifLarger"
          :headerH="headerH"
          :htmlMD="htmlMD"/>
        <!-- 图片格式   -->
        <image-type
          v-else-if="imgType"
          :htmlMD="htmlMD"
          @image-load="loading = false"
          :loading="loading"/>
        <!-- 链接格式,有 一些浏览器阻止页面打开新页面 -->
        <div class="link" v-else-if='linkType'>
          <a :href="htmlMD">链接： {{htmlMD}}</a>
        </div>
        <!-- 其他格式 -->
        <other-type v-else :downloadName="downloadName" :htmlMD="htmlMD"/>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onBeforeMount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import axios from '@/common/axios.js'
import { markdownTypeCheck, imgTypeCheck } from '@/common/methods'
import list from '@/static/list.js'
import leftSidebarProps from '@/common/util/left-sidebar-props'

import layoutLeftSidebar from '@/components/left-sidebar/left-sidebar'
import markdownType from '@/components/home/markdown-type'
import otherType from '@/components/home/other-type'
import imageType from '@/components/home/image-type'

export default {
  name: 'Home',
  components: {
    layoutLeftSidebar,
    markdownType,
    otherType,
    imageType
  },
  props: {
    ...leftSidebarProps
  },
  setup (props) {
    const htmlMD = ref('')
    const title = ref('ReadMe-前言')
    const type = ref('')
    const downloadName = ref('文件')
    const loading = ref(true)
    // markdown类型
    const markdownType = computed(() => markdownTypeCheck(type.value))
    // img类型
    const imgType = computed(() => imgTypeCheck(type.value))
    // 连接类型
    const linkType = computed(() => type.value === 'link')

    // 滚动到顶部
    const scrollTop = () => {
      nextTick(() => {
        document.querySelector('.home').scrollTop = 0
      })
    }
    // 项目点击不同类型回调
    const itemImageTypeClick = (urlLink) => {
      htmlMD.value = urlLink
      scrollTop()
    }
    const itemMarkdownTypeClick = (urlLink) => {
      axios.get(urlLink)
        .then((response) => {
          loading.value = false
          if (type.value === 'js') {
            htmlMD.value = '```js' + '\n' + response.data + '\n' + '```'
            return
          }
          if (type.value === 'ts') {
            htmlMD.value = '```typescript' + '\n' + response.data + '\n' + '```'
            return
          }
          if (type.value === 'html') {
            htmlMD.value = '```html' + '\n' + response.data + '\n' + '```'
            return
          }
          if (type.value === 'jsx') {
            htmlMD.value = '```jsx' + '\n' + response.data + '\n' + '```'
            return
          }
          htmlMD.value = response.data
          scrollTop()
        })
        .catch(e => {
          htmlMD.value = '寄'
          type.value = 'md'
          loading.value = false
          console.log('error', e)
        })
    }
    const itemOtherTypeClick = (url, urlLink) => {
      // 其他类型
      downloadName.value = url[url.length - 1]
      htmlMD.value = urlLink
      scrollTop()
    }

    // 链接文章打开一个新的页面
    const linkClick = (url) => {
      loading.value = false
      type.value = 'link'
      title.value = '链接'
      htmlMD.value = url
      window.open(url)
    }
    // 项目点击
    const itemClick = (url) => {
      const urlSplitArr = url[url.length - 1].split('.')
      type.value = urlSplitArr[urlSplitArr.length - 1] ? urlSplitArr[urlSplitArr.length - 1] : ''
      const urlLink = `./${url.join('/')}`
      title.value = url.join(' > ')
      loading.value = true
      console.log('markdownType.value', markdownType.value)
      // 图片类型
      if (imgType.value) return itemImageTypeClick(urlLink)
      // markdown类型
      if (markdownType.value) return itemMarkdownTypeClick(urlLink)
      // 其他类型
      itemOtherTypeClick(url, urlLink)
    }
    // 携带路由参数
    const hasParamas = (indexPage) => {
      const urlArr = []
      // 切割路由参数，路由参数格式 indexPage=1-1-1
      const pageIndexArr = indexPage.split('-')
      try {
        let result = list
        pageIndexArr.forEach(index => {
          if (Object.prototype.hasOwnProperty.call(result, 'children')) {
            result = result.children[+index]
          } else {
            result = result[+index]
          }
          // 获取每一项菜单或者项目的名称
          urlArr.push(result.name)
        })
        // 没有找到文章索引,跳转到首页即可
        if (!result) {
          return useRouter().push('/')
        }
        // result结果中仍然有子选项
        if (Object.prototype.hasOwnProperty.call(result, 'children')) {
          throw new Error('不合法的路由参数')
        }
        // 是一篇链接文章
        if (result && result.link) {
          return linkClick(result.link)
        }
        // 正常的路由跳转
        itemClick(urlArr)
      } catch (e) {
        useRouter().push('/error')
      }
    }
    // 不携带路由参数
    const hsaNotParams = () => {
      const urlLink = './README.md'
      type.value = 'md'
      loading.value = true
      axios.get(urlLink).then((response) => {
        loading.value = false
        htmlMD.value = response.data
      }).catch(_ => {
        loading.value = false
        htmlMD.value = '寄拉！'
      })
    }

    // 页面即将初始化
    onBeforeMount(() => {
      const { indexPage } = useRoute().query
      props.toggleMenu(false)
      // 当前路由携带参数
      if (indexPage) {
        hasParamas(indexPage)
      } else {
        hsaNotParams()
      }
    })
    return {
      markdownType,
      markdownTitleWidth: ref('300px'), // 侧边导航标题栏宽度
      imgType,
      linkType,
      loading,
      htmlMD,
      title,
      type,
      downloadName,
      itemClick,
      linkClick
    }
  }

}
</script>
<style lang="scss" scoped>
  .content-inner{
    font-size: 15px;
    .bg-image{
      background-attachment: fixed;
      background-image: url("~@/static/image/bingdundun.jpg");
      background-repeat: no-repeat;
      overflow: scroll;
      background-position: center center;
      opacity: 0.15;
      z-index: 0;
    }
    .home{
      overflow-y: scroll;
      .title{
        box-sizing: border-box;
        padding: 0 30px;
        height: 70px;
        font-size: 18px;
        font-weight: 600;
      }
      .link{
        padding: 20px;
      }
    }
  }

</style>
