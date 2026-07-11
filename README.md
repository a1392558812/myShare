# 日常学习收获分享

> - 面试题请查阅 `前端圣经`  
> - `日常分享-xx` 系列属于前端基础技能的前置学习内容  
> - `杂项整理` 收录了工作中可能用到的实用知识与工具方法

---

## FAQ

### 关于页面风格

我个人偏爱简约干净的视觉呈现，但技术类内容最直观的表达方式，往往离不开炫酷的交互效果与华丽的页面设计。因此，我将所有“特效演示”和“开发工具”统一归入 [特效/工具 demo](https://awen-blog.netlify.app/#/demo) 页面，而主站则专注于知识点的系统梳理与展示。

如果你对“特效风”首页感兴趣，可以移步这里体验：[首页（特效版）](https://awen-blog.netlify.app/#/demo/blog-home)

---

### 为什么部分 demo 可以直接预览源码，而另一些不行？

这背后有一段“历史遗留”问题。早期项目结构比较简单，当时计划将所有内容打包后直接部署到 GitHub Pages。但随着博客文章越来越多，一个痛点逐渐显现：**每次新增或修改文章，都必须重新构建整个项目，即便项目本身的代码没有发生任何改动**。

为解决这个问题，我将博客拆分为两个独立仓库：
- **壳子项目**（[vue-blog](https://github.com/a1392558812/vue-blog)）：负责博客基础框架的构建与打包；
- **展示项目**（即当前仓库）：专门存放所有文章内容与 demo 示例。

这样一来，后续更新只需维护展示项目，无需反复打包前端工程。

遗憾的是，早期很多 demo 与壳子项目耦合较深，受限于个人精力，目前仅有 `box-shadow生成器`（[点击体验](https://awen-blog.netlify.app/#/demo)）及之后的 demo 完成了迁移。已迁移的 demo 可以通过 F12 开发者工具或页面上的按钮直接查看源码；更早的 demo 仍需移步壳子项目的 GitHub 仓库中查阅，敬请谅解。

---

### 关于图片路径的说明

这也是一个无奈的取舍。Markdown 写作足够便捷，但要兼顾网页端的展示效果，往往需要额外成本（例如购买服务器或图床服务）。我曾自费购买过一年服务器，但由于站点访问量不大，性价比不高，最终放弃。目前仍未找到稳定且免费的图床方案（此前尝试过多个，均存在图片失效问题），因此部分图片直接以 base64 方式嵌入 Markdown 文件中，导致文件体积偏大。在便捷性与加载速度之间，我选择了前者，还请大家多多包涵。

此外，3D 模型等资源文件本身较大，且部署在 GitHub 后国内访问速度可能不理想，也望各位见谅。

---

### 为什么在 Markdown 中直接写代码？

出发点很简单——**方便大家复制粘贴**。  
很多时候，读者需要的并不是一整个项目文件，而是其中某个功能点或片段。因此，我会在代码注释中融入讲解，既满足快速取用的需求（删掉注释即可），也方便有时间的同学细读注释，加深对实现原理的理解。希望能同时兼顾工作实战与学习提升。

---

## **纵使困顿难行，亦当砥砺奋进！**

<div align=center>
    <img src="./image/jiangwei.jpg" alt="avatar" style="zoom:50%" />
</div>

---

## 代码仓库

- GitHub：[https://github.com/a1392558812/myShare](https://github.com/a1392558812/myShare)
- Gitee（国内镜像）：[https://gitee.com/a1392558812/miscellaneous/tree/master](https://gitee.com/a1392558812/miscellaneous/tree/master)

---

## 博客站点（多线路备用）

- 站点 1（Netlify）：[https://awen-blog.netlify.app/#/](https://awen-blog.netlify.app/#/)
- 站点 2（Cloudflare Pages）：[https://awen-blog.pages.dev/#/](https://awen-blog.pages.dev/#/)
- 站点 3（GitHub Pages，国内访问可能较慢）：[https://a1392558812.github.io/myShare/#/](https://a1392558812.github.io/myShare/#/)
- 站点 4（Vercel，国内访问可能较慢）：[https://my-share-ten.vercel.app/#/](https://my-share-ten.vercel.app/#/)