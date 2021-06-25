module.exports = {
  chainWebpack:config =>{
    // 发布模式
    config.when(process.env.NODE_ENV === 'production',config =>{
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      config.plugin('html').tap(args =>{
        args[0].isprod = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development',config =>{
      config.entry('app').clear().add('./src/main-dev.js')
      config.plugin('html').tap(args =>{
        args[0].isprod = false
        return args
      })
    })
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
    /* 使用代理 */
    proxy: {
      '/api': {
        target: 'http://localhost:5000/', //设置你调用的接口域名和端口号 别忘了加http
        changeOrigin: true, //允许跨域
        pathRewrite: {
          '^/api': '' // 在请求的时候 凡是/api开头的地址都可以跨域
        }
      }
    }
  }
}
