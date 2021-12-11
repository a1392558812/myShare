<template>
  <div class="content-inner flex relative flex-direction-row">
    <layout-left-sidebar
      :leftSidebarW="leftSidebarW"
      :ifShowMenu="ifShowMenu"
      :ifLarger="ifLarger"
      @linkClick="linkClick"
      @itemClick="itemClick"/>
    <div class="home">
      <div class="title flex align-items-center justify-content-center">{{ title }}</div>
      <!-- md格式 -->
      <div class="markdown" v-if="markdownType()">
        <v-md-preview  :text="htmlMD"></v-md-preview>
      </div>
      <!-- 图片格式 -->
      <div v-else-if="imgType()" class="image">
        <div>预览 / 点击查看详情</div>
        <div class="image-wrap flex">
          <div v-show="!imageLoading" class="image-content" @click="showPopup = true">
            <img  @load="imageLoading = false" :src="htmlMD" :alt="htmlMD"/>
          </div>
          <div v-show="imageLoading"> φ(≧ω≦*)♪图片正在努力加载中...</div>
        </div>
      </div>
      <!-- 链接格式,有一些浏览器阻止页面打开新页面 -->
      <div class="link" v-else-if='linkType()'>
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
      <div class="popup flex align-items-center justify-content-center" v-if="showPopup" @click="showPopup = false">
        <img :src="htmlMD" :alt="htmlMD"/>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'

import axios from '@/common/axios.js'
import { markdownTypeCheck, imgTypeCheck } from '@/common/methods'
import list from '@/static/list.js'

import layoutLeftSidebar from '@/components/left-sidebar'

export default {
  name: 'Home',
  components: {
    layoutLeftSidebar
  },
  props: {
    leftSidebarW: {
      type: String,
      default: '300px'
    },
    ifLarger: {
      type: Boolean,
      default: true
    },
    ifShowMenu: {
      type: Boolean,
      default: true
    }
  },
  setup () {
    const htmlMD = ref('')
    const title = ref('ReadMe-前言')
    const type = ref('')
    const downloadName = ref('文件')
    const imageLoading = ref(true)
    // 滚动到顶部
    const scrollTop = () => {
      nextTick(() => {
        document.querySelector('.home').scrollTop = 0
      })
    }
    // 链接文章打开一个新的页面
    const linkClick = (url) => {
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
      // 图片类型
      if (imgTypeCheck(type.value)) {
        htmlMD.value = urlLink
        return
      }
      // markdown类型
      if (markdownTypeCheck(type.value)) {
        return axios.get(urlLink)
          .then((response) => {
            console.log('response', response)
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
          }).catch(_ => {
            htmlMD.value = ''
          })
      }
      // 其他类型
      downloadName.value = url[url.length - 1]
      htmlMD.value = urlLink
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
      axios.get(urlLink).then((response) => {
        htmlMD.value = response.data
        type.value = 'md'
        console.log('type', type)
      })
    }

    // 页面初始化
    onBeforeMount(() => {
      const { indexPage } = useRouter().currentRoute.value.query
      console.log('indexPage', indexPage)
      // 当前路由携带参数
      if (indexPage) {
        hasParamas(indexPage)
      } else {
        hsaNotParams()
      }
    })

    watch(
      () => htmlMD.value,
      (newV, oldV) => {
        if (newV !== oldV) {
          imageLoading.value = true
          scrollTop()
        }
      }
    )
    return {
      markdownType () {
        return markdownTypeCheck(type.value)
      },
      imgType () {
        return imgTypeCheck(type.value)
      },
      linkType () {
        return type.value === 'link'
      },
      itemClick,
      linkClick,
      showPopup: ref(false),
      imageLoading,
      htmlMD,
      title,
      type,
      downloadName
    }
  }

}
</script>
<style lang="scss" scoped>
  .content-inner{
    width: 100%;
    height: 100%;
    .home{
      width: 100%;
      height: 100%;
      overflow: scroll;
      .title{
        box-sizing: border-box;
        padding: 0 30px;
        width: 100%;
        height: 70px;
        font-size: 18px;
        font-weight: 600;
      }
      .markdown{
        padding-bottom: 100px;
        z-index: 0;
      }
      .image{
        width: 100%;
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
        overflow: scroll;
        z-index: 100;
        background-color: rgba(0,0,0,0.7);
        img{
          max-width: 90%;
        }
      }
    }
  }
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }
</style>
