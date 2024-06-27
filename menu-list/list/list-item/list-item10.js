export default {
  name: '10.日常分享-基础',
  children: [
    { name: '2D版开机动画(手机端).md' },
    { name: '3D开机动画(手机端).md' },
    { name: 'flex应用(淘宝).md' },
    { name: 'step函数实现动画图.md' },
    { name: '响应式布局.md' },
    { name: '垂直居中方案.md' },
    { name: '多列布局.md' },
    { name: '等分布局.md' },

    {
      name: 'flex布局',
      children: [
        {
          name: '新版flex',
          children: [
            { name: 'flex-grow.md' },
            { name: '新版本flex容器.md' },
            { name: '新版本弹性空间管理.md' },
            { name: '新版本新增.md' },
            { name: '新版本项目新增.md' }
          ]
        },
        {
          name: '老版本flex',
          children: [
            { name: '老版本flex容器.md' },
            { name: '老版本弹性空间管理.md' }
          ]
        }
      ]
    },

    {
      name: 'img',
      children: [
        { name: '02.jpg' },
        { name: '03.jpg' },
        { name: 'png与bgi图片在上一篇‘日常分享’中' },
        { name: 'timg.jpg' }
      ]
    },

    { name: 'js', children: [{ name: 'data.js' }] },

    {
      name: 'less预处理器',
      children: [
        { name: 'less处理.md' },
        { name: 'less的匹配模式.md' },
        { name: 'less的混合.md' },
        { name: '变量的延时加载.md' }
      ]
    }

  ]
}
