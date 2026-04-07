# 分享一些日常学习收获

> 面试题在`前端圣经`文件夹中
> `日常分享-xx`系列为基础前端技能的前置学习内容
> `杂项整理`包含工作中可能用到的知识和工具方法

## FAQ

### 关于页面风格

个人偏好简约风格，但技术展示最直观的方式往往是通过炫酷的效果和华丽的页面。因此，将一些特效演示统一放在[特效 demo](https://awen-blog.netlify.app/#/demo)中，主页则专注于展示知识点。

### 特效demo中有些可以直接预览源码，有些不可以

由于历史原因，早期项目设计较为简单，原本计划直接打包部署到 GitHub Pages。但随着博客文章逐渐增多，出现了一个问题：**每次新增或更新文章，都需要重新打包整个项目，即便项目本身的代码没有任何改动。**

后来我将博客拆分为两个项目：一个是负责打包生成博客基础结构的[壳子项目](https://github.com/a1392558812/vue-blog)，另一个是专门存放文章与 demo 的展示项目（即当前仓库）。这样后续更新只需修改展示项目，无需重复打包整个前端工程。

许多早期的demo与**壳子项目**耦合在一起，由于精力有限，目前只有[box-shadow生成器](https://awen-blog.netlify.app/#/demo)及之后的demo完成了迁移。这些迁移后的demo可以通过F12或页面按钮直接查看源码，而之前的demo仍需到blog项目中查看。

### 关于图片路径的问题

这也是无奈之举，兼顾了Markdown的便捷性就难以兼顾网页的展示效果（主要是不想花费成本购买服务器，之前买过一年但点击量很低，相当于白花了钱）

### 有一些文章加载比较慢

主要是为了解决上面提到的图片路径问题（一直没找到合适的免费图床，经常遇到图片失效的情况），所以直接将图片嵌入到Markdown文件中，导致文件体积较大，只能在便捷性和加载速度之间做出取舍。此外，3D模型文件本身就比较大，部署到GitHub后访问速度也会受到影响，还请大家多包涵。

### 为什么在 markdown 里写代码

原因其实很简单，就是为了方便大家复制粘贴。很多时候，大家需要的并不是完整的文件，而是其中的某个功能点。因此，我将一些讲解直接写在代码注释中，兼顾了工作和学习的需求。时间紧迫时可以直接复制粘贴代码，删除注释即可；时间充裕时则可以仔细阅读注释，加深对知识点的理解。

## **纵使困顿难行，亦当砥砺奋进！**

<div align=center>
    <img src="./image/jiangwei.jpg" alt="avatar" style="zoom:50%" />
</div>

## github 地址

- github 地址：[https://github.com/a1392558812/myShare](https://github.com/a1392558812/myShare)
- gitee 地址：[https://gitee.com/a1392558812/miscellaneous/tree/master](https://gitee.com/a1392558812/miscellaneous/tree/master)

## 博客站点

- 站点 1：[https://awen-blog.netlify.app/#/](https://awen-blog.netlify.app/#/)
- 站点 2：[https://awen-blog.pages.dev/#/](https://awen-blog.pages.dev/#/)
- 站点 3（国内访问可能较慢）：[https://a1392558812.github.io/myShare/#/](https://a1392558812.github.io/myShare/#/)
- 站点 4（国内访问可能较慢）：[https://my-share-ten.vercel.app/#/](https://my-share-ten.vercel.app/#/)
