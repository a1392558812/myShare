<template>
  <div class="home">
    <el-container class="home-container">
      <!-- 头部区 -->
      <el-header class="home-header">
        <div class="home-logo">
          <h1>电商后台管理系统</h1>
        </div>
        <div class="home-userinfo">
          <el-button type="info" @click="logout">登出</el-button>
        </div>
      </el-header>
      <!-- 主体区 -->
      <el-container class="home-main">
        <!-- 侧边栏 -->
        <el-aside class="home-main-menu" :width="ifOpen?'64px':'200px'">
          <div class="home-main-menu-toggle-button" @click="toggleCollapse">
            <i class="el-icon-s-unfold" v-if="ifOpen"></i>
            <i class="el-icon-s-fold" v-if="!ifOpen"></i>
          </div>
          <!-- 菜单项 -->
          <el-menu
            :default-active="nowActive"
            class="el-menu-vertical-demo"
            :collapse="ifOpen"
            :collapse-transition="false"
            @open="handleOpen"
            @close="handleClose"
            :unique-opened="true"
            :router="true"
            background-color="#373d41"
            text-color="#fff"
            active-text-color="#409EFF"
          >
            <el-submenu :index="item._id" v-for="item in menulist" :key="item._id">
              <template slot="title">
                <i :class="iconObj[item.root_id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item
                @click="nowClick(child.path,item)"
                :index="child.path"
                v-for="child in item.children"
                :key="child.root_id"
              >
                <i class="el-icon-menu"></i>
                {{child.authName}}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container class="home-main-body">
          <el-main class="home-main-body-main">
            <!-- welcome路由 -->
            <router-view></router-view>
          </el-main>
          <el-footer class="home-main-body-footer">嘟嘟嘟嘟嘟嘟ヾ(o◕∀◕)ﾉヾ</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import { requestMenu } from '../../ajax/index'
export default {
  data() {
    // 初始化数据
    return {
      nowItem: {},
      nowActive: '',
      ifOpen: false, // 点击按钮切换菜单的折叠与展开
      menulist: [],
      iconObj: {
        100: 'el-icon-user-solid',
        200: 'el-icon-s-platform',
        300: 'el-icon-s-goods',
        400: 'el-icon-s-order',
        500: 'el-icon-s-marketing'
      }
    }
  },
  beforeCreate() {
    // 创建前状态
  },
  created() {
    // 创建完毕状态
    this.getRequestMenu()
    this.nowActive = window.sessionStorage.getItem('nowActive')
  },
  beforeMount() {
    // 初始化完成前状态
  },
  mounted() {
    //初始化完成后的回调函数
  },
  beforeUpdate: function() {
    // 更新前状态
  },
  updated: function() {
    // 更新完成状态
  },
  beforeDestroy: function() {
    // 销毁前状态
  },
  destroyed: function() {
    // 销毁完成状态
  },
  computed: {
    // 计算属性
  },
  watch: {
    // 深度监视，数据一旦发生改变，立马更新保存数据
  },
  methods: {
    // 定义函数
    nowClick(value, item) {
      this.nowActive = value
      this.nowItem = item
      console.log(value, item)
      window.sessionStorage.setItem('nowActive', value)
    },
    toggleCollapse() {
      // 点击按钮切换菜单的折叠与展开
      this.ifOpen = !this.ifOpen
    },
    async getRequestMenu() {
      const result = await requestMenu()
      if (result.code === 0) {
        console.log('请求成功')
        this.menulist = result.data
        console.log(result.data)
      } else {
        this.$message.error('请求失败，请刷新重试')
      }
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.replace('/login')
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    }
  },
  components: {
    // 解构映射到组件
  }
}
</script>
<style scoped lang='less'>
.home {
  height: 100%;
  width: 100%;
  overflow: hidden;
  .home-container {
    height: 100%;
    border: 1px solid #eee;
    .home-header {
      height: 80px !important;
      display: flex;
      flex-direction: row;
      background-color: #373d41;
      .home-logo {
        width: 50%;
        height: 100%;
        padding-left: 60px;
        display: flex;
        flex-direction: row;
        align-items: center;
        h1 {
          font-size: 30px;
          color: #ddd6d6;
        }
      }
      .home-userinfo {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
      }
    }
    .home-main {
      width: 100%;
      height: 681px;
      .home-main-menu {
        transition: width 0.2s;
        letter-spacing: 0.1em;
        background-color: #373d41;
        .home-main-menu-toggle-button {
          background: #4a5064;
          cursor: pointer;
          text-align: center;
          font-size: 25px;
          color: white;
        }
        .el-menu {
          border-right: none;
        }
      }
      .home-main-body {
        height: 100%;
        width: 100%;
        .home-main-body-main {
          height: 100%;
          width: 100%;
          background-color: #eaedf1;
        }
        .home-main-body-footer {
          line-height: 60px;
          background-color: #fff;
          text-align: center;
          vertical-align: middle;
        }
      }
    }
  }
  .iconfont {
    margin-right: 5px;
  }
}
</style>
