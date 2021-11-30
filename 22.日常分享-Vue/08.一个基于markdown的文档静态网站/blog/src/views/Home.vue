<template>
  <div class="home">
    <div class="title">{{ title }}</div>
    <!-- md格式 js/ts格式 -->
    <div class="markdown" v-if="markdownType()">
      <v-md-preview  :text="htmlMD"></v-md-preview>
    </div>
    <!-- 图片格式 -->
    <div v-else-if="type === 'jpg' || type === 'png' || type === 'gif'" class="image">
      <div>预览 / 点击查看详情</div>
      <div class="image-wrap">
        <div class="image-content" @click="showPopup = true">
          <img :src="htmlMD" :alt="htmlMD"/>
        </div>
      </div>
    </div>
    <!-- 其他格式 -->
    <div v-else class="other-type">
      <div class="downLoad-cell">链接： {{htmlMD}}</div>
      <div class="downLoad-cell">文件名： {{downloadName}}</div>
      <div class="downLoad-cell downLoad-wrap">
        <a class="downLoad" :href="htmlMD" :download="downloadName">下载</a>
      </div>
    </div>
    <div class="popup" v-if="showPopup" @click="showPopup = false">
      <img :src="htmlMD" :alt="htmlMD"/>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { typeCheck } from '@/common/methods'
export default {
  name: 'Home',
  props: {
    htmlMD: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    downloadName: {
      type: String,
      default: '文件'
    },
    type: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    return {
      markdownType () {
        return typeCheck(props.type)
      },
      showPopup: ref(false)
    }
  }

}
</script>
<style lang="scss" scoped>
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
      display: flex;
      align-items: center;
      justify-content: center;
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
        display: flex;
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
        display: flex;
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
    .popup{
      display: flex;
      align-items: center;
      justify-content: center;
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
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }
</style>
