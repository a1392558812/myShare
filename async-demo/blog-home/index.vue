<template>
  <div class="blog-wrapper">
    <SteampunkBackground />

    <BlogHeader v-model="searchQuery" />

    <div class="blog-main">
      <div class="container">
        <main class="content-area">
          <FilterSection :tags="filterTags" v-model="activeTag" />

          <div class="article-list">
            <ArticleCard v-for="(article, index) in filteredArticles" :key="article.id" :article="article"
              :index="index" />
          </div>

          <LoadMore />
        </main>

        <aside class="sidebar">
          <ProfileCard />
          <HotTags :tags="hotTags" />
          <RecommendArticles :articles="recommendArticles" />
        </aside>
      </div>
    </div>

    <BlogFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SteampunkBackground from './components/SteampunkBackground.vue'
import BlogHeader from './components/BlogHeader.vue'
import FilterSection from './components/FilterSection.vue'
import ArticleCard from './components/ArticleCard.vue'
import LoadMore from './components/LoadMore.vue'
import ProfileCard from './components/ProfileCard.vue'
import HotTags from './components/HotTags.vue'
import RecommendArticles from './components/RecommendArticles.vue'
import BlogFooter from './components/BlogFooter.vue'

const searchQuery = ref('')

const filterTags = ['全部', 'Vue.js', 'React', 'CSS/SCSS', 'TypeScript', 'Node.js', '工程化', '性能优化']
const activeTag = ref('全部')

const articles = ref([
  {
    id: 1,
    title: '我是真的喜欢玩《我的世界》的，特别是附属模组 “机械动力 ~~”',
    excerpt: '《机械动力》（英文名 Create）是 MC 超热门工业机械模组，主打可视化齿轮传动、蒸汽工业、实体机械结构，区别于其他科技模组（如通用机械、mek）的电能体系，核心是旋转动力 + 应力 SU 系统，复古蒸汽朋克画风，兼具自动化工厂、巨型可动机械、建筑施工工具三大玩法。…',
    category: 'Vue.js',
    cover: true,
    coverGradient: 'linear-gradient(135deg, #2c3e50, #3498db)', // 假设没有背景图时用
    coverIcon: '🐮',
    tags: ['Vue3', 'Composition API', '实战'],
    date: '战锤8848年-13月-20日',
    views: '2.8k',
    comments: 42,
    likes: 189,
    author: '牢Awen',
    authorColor: '#c9a96e',
    accent: '#c9a96e'
  },
  {
    id: 2,
    title: 'CSS 如何使用css美化页面？',
    excerpt: 'js不难，css难，js有错他会报错。但css不会，他只会渲染，默默的渲染…',
    category: 'CSS/SCSS',
    cover: true,
    coverGradient: 'linear-gradient(135deg, #c9a96e, #8b6914)',
    coverIcon: '🐴',
    tags: ['CSS', '蒸汽朋克', '动画'],
    date: '战锤8848年-13月-18日',
    views: '3.5k',
    comments: 67,
    likes: 256,
    author: '牢Awen',
    authorColor: '#c9a96e',
    accent: '#c9a96e'
  },
  {
    id: 3,
    title: 'Create 机械动力（机械动力）完整模组风格解析',
    excerpt: '整体属于复古蒸汽朋克（Steampunk）+ 齿轮钟表朋克，区别于其他 MC 工业模组的冷硬科技风，主打外露可视机械、复古黄铜工业、自然柔和复古色调，同时完美贴合原版 MC 像素美术，不会突兀割裂原版世界…',
    category: 'React',
    cover: true,
    coverGradient: 'linear-gradient(135deg, #2d1b4e, #61dafb)',
    coverIcon: '🍺',
    tags: ['React', 'RSC', 'SSR'],
    date: '战锤8848年-06月-15日',
    views: '4.1k',
    comments: 89,
    likes: 312,
    author: '牢Awen',
    authorColor: '#c9a96e',
    accent: '#c9a96e'
  },
  {
    id: 4,
    title: '美术底层：低饱和度复古调色板 + 磨损复古质感',
    excerpt: '主色调：暖黄铜金、哑光铜红、做旧深铁灰、原木棕、磨砂玻璃；低对比度，没有赛博、未来模组那种高饱和荧光色，所有金属部件带轻微氧化铜绿、油污、铆钉、划痕纹理，自带 “长期使用的老式工厂” 年代感，拒绝光滑全新科幻金属…',
    category: 'TypeScript',
    cover: true,
    coverGradient: 'linear-gradient(135deg, #1a365d, #3178c6)',
    coverIcon: '🤤',
    tags: ['TypeScript', '类型系统', '新特性'],
    date: '战锤8848年-17月-12日',
    views: '2.3k',
    comments: 35,
    likes: 178,
    author: '牢Awen',
    authorColor: '#c9a96e',
    accent: '#c9a96e'
  },
  {
    id: 5,
    title: '前端工程化之路：从 Webpack 到 Turbopack 的迁移实践',
    excerpt: '随着项目的增长，构建速度成为瓶颈。本文记录了一个中型项目从 Webpack 迁移到 Turbopack 的完整过程、遇到的坑和性能对比…',
    category: '工程化',
    cover: false,
    coverGradient: '',
    coverIcon: '🥵',
    tags: ['工程化', 'Webpack', 'Turbopack'],
    date: '战锤8848年-06月-10日',
    views: '1.9k',
    comments: 28,
    likes: 145,
    author: '牢Awen',
    authorColor: '#e74c3c',
    accent: '#e74c3c'
  },
  {
    id: 6,
    title: '性能优化实战：从 60 分到 95 分的 Lighthouse 提升指南',
    excerpt: '网站性能直接影响用户体验和 SEO 排名。本文分享一套经过验证的性能优化方案，涵盖图片优化、代码分割、缓存策略等核心环节…',
    category: '性能优化',
    cover: true,
    coverGradient: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
    coverIcon: '🤖',
    tags: ['性能优化', 'Lighthouse', 'Core Web Vitals'],
    date: '战锤8848年-15月-08日',
    views: '5.2k',
    comments: 112,
    likes: 423,
    author: '牢Awen',
    authorColor: '#c9a96e',
    accent: '#c9a96e'
  }
])

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeTag.value !== '全部') {
    list = list.filter(a => a.category === activeTag.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

const hotTags = [
  { name: 'Vue.js', size: 18, opacity: 1 },
  { name: 'React', size: 16, opacity: 0.85 },
  { name: 'CSS', size: 14, opacity: 0.7 },
  { name: 'JavaScript', size: 17, opacity: 0.95 },
  { name: 'TypeScript', size: 15, opacity: 0.8 },
  { name: 'Webpack', size: 12, opacity: 0.55 },
  { name: 'Vite', size: 16, opacity: 0.85 },
  { name: '性能优化', size: 13, opacity: 0.65 },
  { name: 'Node.js', size: 14, opacity: 0.7 },
  { name: '设计模式', size: 12, opacity: 0.55 },
  { name: '算法', size: 13, opacity: 0.6 },
  { name: '工程化', size: 15, opacity: 0.8 },
  { name: '微前端', size: 12, opacity: 0.5 },
  { name: 'Three.js', size: 11, opacity: 0.45 },
  { name: 'WebGL', size: 11, opacity: 0.45 }
]

const recommendArticles = [
  { id: 1, title: '8848 年前端技术趋势报告', accent: '#FB7299' },
  { id: 2, title: '深入理解浏览器渲染原理', accent: '#c9a96e' },
  { id: 3, title: 'Vue 3.5 源码解析系列', accent: '#3498db' },
  { id: 4, title: 'CSS Container Queries 实战', accent: '#e74c3c' },
  { id: 5, title: '从零搭建 Monorepo 工具链', accent: '#2d6a4f' }
]
</script>

<style lang="scss" scoped>
// ===== 配色变量 =====
$bili-pink: #FB7299;
$bili-pink-light: #ff8db3;
$bili-pink-dark: #d95a7a;

$steampunk-brass: #c9a96e;
$steampunk-brass-light: #e0c88e;
$steampunk-brass-dark: #a08040;
$steampunk-copper: #b87333;
$steampunk-bronze: #8c7853;

$bg-primary: #1a1520;
$bg-secondary: #231e2a;
$bg-card: #2a2433;
$bg-card-hover: #322b3d;
$bg-sidebar: #241f2d;

$text-primary: #e8e0d5;
$text-secondary: #b8a99a;
$text-muted: #7a6e62;
$text-bright: #f5eee0;

$border-color: rgba(201, 169, 110, 0.25);
$border-brass: rgba(201, 169, 110, 0.5);

$shadow-brass: 0 0 20px rgba(201, 169, 110, 0.08);
$shadow-pink: 0 0 20px rgba(251, 114, 153, 0.1);

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Orbitron:wght@400;700;900&display=swap');

.blog-wrapper {
  --bili-pink: #{$bili-pink};
  --steampunk-brass: #{$steampunk-brass};
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: $bg-primary;
  color: $text-primary;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  line-height: 1.6;

  * {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s ease;
  }
}

.blog-main {
  position: relative;
  z-index: 1;
  padding: 32px 0 60px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 32px;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 960px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 12px;
  }

  .blog-main {
    padding: 20px 0 40px;
  }
}
</style>
