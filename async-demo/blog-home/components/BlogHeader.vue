<template>
  <header class="blog-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo-wrapper">
          <svg class="logo-gear" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="12" fill="none" stroke="#FB7299" stroke-width="3" class="logo-ring" />
            <g class="logo-teeth">
              <rect x="26" y="4" width="8" height="12" rx="2" fill="#c9a96e" />
              <rect x="26" y="44" width="8" height="12" rx="2" fill="#c9a96e" />
              <rect x="4" y="26" width="12" height="8" rx="2" fill="#c9a96e" />
              <rect x="44" y="26" width="12" height="8" rx="2" fill="#c9a96e" />
              <rect x="11" y="11" width="10" height="8" rx="2" fill="#c9a96e" transform="rotate(45 16 15)" />
              <rect x="39" y="11" width="10" height="8" rx="2" fill="#c9a96e" transform="rotate(-45 44 15)" />
              <rect x="11" y="41" width="10" height="8" rx="2" fill="#c9a96e" transform="rotate(-45 16 45)" />
              <rect x="39" y="41" width="10" height="8" rx="2" fill="#c9a96e" transform="rotate(45 44 45)" />
            </g>
            <circle cx="30" cy="30" r="5" fill="#FB7299" />
          </svg>
        </div>
        <div class="brand">
          <h1 class="blog-title">
            <span class="title-bracket">&lt;</span>
            前端技术分享
            <span class="title-bracket">/&gt;</span>
          </h1>
          <p class="blog-tagline">Code the gears that turn the web.</p>
        </div>
      </div>

      <nav class="header-nav">
        <a href="#" class="nav-link active">
          <span class="nav-icon">&#9900;</span> 首页
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">&#9881;</span> 文章
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">&#9919;</span> 分类
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">&#8986;</span> 关于
        </a>
      </nav>

      <div class="header-right">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="搜索文章..." class="search-input" />
          <button class="search-btn">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style lang="scss" scoped>
$bili-pink: #FB7299;
$steampunk-brass: #c9a96e;
$steampunk-brass-light: #e0c88e;
$border-color: rgba(201, 169, 110, 0.25);
$text-primary: #e8e0d5;
$text-secondary: #b8a99a;
$text-muted: #7a6e62;
$text-bright: #f5eee0;

.blog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(26, 21, 32, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-color;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $steampunk-brass, $bili-pink, $steampunk-brass, transparent);
    opacity: 0.6;
  }
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo-wrapper {
  width: 42px;
  height: 42px;
}

.logo-gear {
  width: 100%;
  height: 100%;
  animation: gearSpin 8s linear infinite;
}

.logo-ring {
  stroke-dasharray: 75;
  animation: logoDash 3s linear infinite;
}

@keyframes logoDash {
  to {
    stroke-dashoffset: -150;
  }
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.brand {
  display: flex;
  flex-direction: column;
}

.blog-title {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 20px;
  font-weight: 900;
  margin: 0;
  letter-spacing: 2px;
  background: linear-gradient(135deg, $steampunk-brass-light, $bili-pink, $steampunk-brass);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-bracket {
  color: $steampunk-brass;
  -webkit-text-fill-color: $steampunk-brass;
}

.blog-tagline {
  font-size: 11px;
  color: $text-muted;
  margin: 0;
  letter-spacing: 1px;
  font-family: 'Orbitron', sans-serif;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: $text-secondary;
  transition: all 0.3s ease;
  position: relative;

  .nav-icon {
    font-size: 12px;
    color: $steampunk-brass;
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  &:hover {
    color: $text-bright;
    background: rgba(201, 169, 110, 0.08);

    .nav-icon {
      opacity: 1;
    }
  }

  &.active {
    color: $bili-pink;
    background: rgba(251, 114, 153, 0.1);

    .nav-icon {
      color: $bili-pink;
      opacity: 1;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: $bili-pink;
      border-radius: 1px;
    }
  }
}

.header-right {
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(42, 36, 51, 0.7);
  border: 1px solid $border-color;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: $bili-pink;
    box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
  }
}

.search-input {
  width: 180px;
  padding: 8px 14px;
  background: none;
  border: none;
  color: $text-primary;
  font-size: 13px;
  outline: none;

  &::placeholder {
    color: $text-muted;
  }
}

.search-btn {
  padding: 8px 12px;
  background: none;
  border: none;
  color: $steampunk-brass;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: $bili-pink;
  }
}

@media (max-width: 960px) {
  .header-nav {
    display: none;
  }

  .blog-title {
    font-size: 16px;
  }

  .search-input {
    width: 140px;
  }
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 12px;
    height: 56px;
  }

  .blog-tagline {
    display: none;
  }

  .search-input {
    width: 100px;
  }
}
</style>
