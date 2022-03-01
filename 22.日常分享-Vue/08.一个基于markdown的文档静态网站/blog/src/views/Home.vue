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
    <div class="relative width100 height100">
      <!-- 背景图 -->
      <div class="bg-image width100 height100 absolute"></div>
      <div class="home relative width100 height100">
        <!-- 标题 -->
        <div class="title width100 flex align-items-center justify-content-center">{{ title }}</div>
        <!-- md格式 -->
        <div
          class="relative markdown"
          v-loading="loading"
          v-if="markdownType">
          <v-md-preview v-if="!loading" :text="htmlMD"></v-md-preview>
          <div v-else>加载中...</div>
        </div>
        <!-- 图片格式 -->
        <div v-else-if="imgType" class="image width100">
          <div>预览 / 点击查看详情</div>
          <div class="image-wrap flex">
            <div v-show="!loading" class="image-content" @click="openPopup">
              <img  @load="imageLoad" :src="htmlMD" :alt="htmlMD"/>
            </div>
            <div v-show="loading">
              <div>github响应有点慢，莫急,已加载{{imageloadingTime}}秒</div>
              <div class="loading">φ(≧ω≦*)♪图片正在努力加载中</div>
            </div>
          </div>
        </div>
        <!-- 链接格式,有 一些浏览器阻止页面打开新页面 -->
        <div class="link" v-else-if='linkType'>
          <a :href="htmlMD">链接： {{htmlMD}}</a>
        </div>
        <!-- 其他格式 -->
        <div v-else class="other-type">
          <div class="downLoad-cell">链接： {{htmlMD}}</div>
          <div class="downLoad-cell">文件名： {{downloadName}}</div>
          <div class="downLoad-cell downLoad-wrap flex">
            <a class="downLoad" :href="htmlMD" :download="downloadName">下载</a>
          </div>
        </div>
        <!-- 图片大屏展示 -->
        <div
          class="popup flex align-items-center justify-content-center relative"
          v-if="showPopup"
          @click="showPopup = false">
          <img :src="htmlMD" :alt="htmlMD"/>
          <button
            ref="closeModal"
            @keydown.esc="showPopup = false"
            class="absolute hide-button"></button>
        </div>
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

export default {
  name: 'Home',
  components: {
    layoutLeftSidebar
  },
  props: {
    ...leftSidebarProps
  },
  setup (props) {
    let timer = null // 定时器
    const closeModal = ref(null) // closeModal引用
    const htmlMD = ref('')
    const title = ref('ReadMe-前言')
    const type = ref('')
    const downloadName = ref('文件')
    const loading = ref(true)
    const imageloadingTime = ref(1) // 图片加载了多长时间
    const showPopup = ref(false) // 是否显示大图
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
    // 链接文章打开一个新的页面
    const linkClick = (url) => {
      loading.value = false
      type.value = 'link'
      title.value = '链接'
      htmlMD.value = url
      window.open(url)
    }
    // 项目点击不同类型回调
    const itemImageTypeClick = (urlLink) => {
      htmlMD.value = urlLink
      clearInterval(timer)
      imageloadingTime.value = 0
      timer = setInterval(() => {
        imageloadingTime.value++
      }, 1000)
      scrollTop()
    }
    const itemMarkdownTypeClick = (urlLink) => {
      axios.get(urlLink)
        .then((response) => {
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
          loading.value = false
          scrollTop()
        })
        .catch(_ => {
          htmlMD.value = '寄'
          type.value = 'md'
          loading.value = false
        })
    }
    const itemOtherTypeClick = (url, urlLink) => {
      // 其他类型
      downloadName.value = url[url.length - 1]
      htmlMD.value = urlLink
      scrollTop()
    }
    // 项目点击
    const itemClick = (url) => {
      const urlSplitArr = url[url.length - 1].split('.')
      type.value = urlSplitArr[urlSplitArr.length - 1] ? urlSplitArr[urlSplitArr.length - 1] : ''
      const urlLink = `./${url.join('/')}`
      title.value = url.join(' > ')
      loading.value = true
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
    // 打开图片模态框
    const openPopup = () => {
      showPopup.value = true
      nextTick(() => {
        closeModal.value.focus()
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
      imgType,
      linkType,
      showPopup,
      closeModal,
      loading,
      htmlMD,
      title,
      type,
      downloadName,
      imageloadingTime,
      itemClick,
      linkClick,
      openPopup,
      imageLoad: () => {
        clearInterval(timer)
        imageloadingTime.value = 0
        loading.value = false
      }
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
      .markdown{
        min-width: 100%;
        min-height: calc(100% - 170px);
        padding-bottom: 100px;
        z-index: 0;
      }
      .image{
        padding-left: 30px;
        box-sizing: border-box;
        .image-wrap{
          margin-top: 20px;
        }
        &-content{
          max-width: 200px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          padding: 10px;
          border-radius: 10px;
          &::before {
            content: '';
            position: absolute;
            z-index: -2;
            left: -50%;
            top: -50%;
            width: 200%;
            height: 200%;
            background-color: #fff;
            background-repeat: no-repeat;
            background-size: 50% 50%;
            background-position: 0 0;
            background-image: conic-gradient(#399953, #399953);
            animation: rotate 4s linear infinite;
          }
          &::after {
            content: '';
            position: absolute;
            z-index: -1;
            left: 6px;
            top: 6px;
            width: calc(100% - 12px);
            height: calc(100% - 12px);
            background: white;
            border-radius: 5px;
          }
          img{
            display: block;
            width: 100%;
            z-index: 2;
          }
        }
        &-btn{
          margin: 0 10px 10px 0;
        }
        .loading {
          &::after {
            content: "...";
            overflow: hidden;
            display: inline-block;
            vertical-align: bottom;
            animation: ellipsis-dot 1s infinite .3s;
            animation-fill-mode: fowards;
            width: 1.25em;
          }
        }
      }
      .other-type{
        padding: 20px;
        .downLoad-cell{
          margin-bottom: 5px;
        }
        .downLoad-wrap{
          .downLoad{
            display: block;
            text-decoration: none;
            color: black;
            background-color: #eee;
            line-height: 1;
            font-size: 14px;
            padding: 8px 15px;
            border-radius: 5px;
          }
        }
      }
      .link{
        padding: 20px;
      }
      .popup{
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        overflow: auto;
        z-index: 100;
        background-color: rgba(0,0,0,0.7);
        img{
          max-width: 90%;
        }
        .hide-button{
          padding: 0;
          border: 0;
          z-index: -1;
        }
      }
    }
  }

  @keyframes ellipsis-dot {
    25% {
      content: "";
    }
    50% {
      content: ".";
    }
    75% {
      content: "..";
    }
    100% {
      content: "...";
    }
  }
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }
</style>
