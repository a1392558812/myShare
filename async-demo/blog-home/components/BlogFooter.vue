<template>
  <footer class="blog-footer">
    <div class="footer-top-deco"></div>
    <div class="footer-content">
      <div class="footer-brand">
        <span class="footer-gear">&#9881;</span>
        <span class="footer-title">&lt;前端技术分享/&gt;</span>
        <span class="footer-gear">&#9881;</span>
      </div>
      <p class="footer-desc">用代码驱动世界，用技术连接未来。</p>
      <div class="footer-links">
        <a href="#">关于本站</a>
        <span class="footer-sep">|</span>
        <a href="#">友情链接</a>
        <span class="footer-sep">|</span>
        <a href="#">github 订阅</a>
        <span class="footer-sep">|</span>
        <a href="#">联系咱</a>
      </div>
      <p class="footer-copy">&copy; {{ currentYear }} 前端技术分享 · Powered by Passion &amp; Coffee</p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style lang="scss" scoped>
$steampunk-brass: #c9a96e;
$bili-pink: #FB7299;
$border-color: rgba(201, 169, 110, 0.25);
$text-muted: #7a6e62;
$text-secondary: #b8a99a;
$steampunk-brass-light: #e0c88e;

.blog-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid $border-color;
}

.footer-top-deco {
  height: 3px;
  background: linear-gradient(90deg,
      transparent 0%,
      $steampunk-brass 20%,
      $bili-pink 50%,
      $steampunk-brass 80%,
      transparent 100%);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.footer-gear {
  font-size: 18px;
  color: $steampunk-brass;
  animation: gearSpin 6s linear infinite;
}

.footer-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: $steampunk-brass-light;
  letter-spacing: 2px;
}

.footer-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: $text-muted;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;

  a {
    font-size: 13px;
    color: $text-secondary;
    transition: color 0.3s ease;

    &:hover {
      color: $bili-pink;
    }
  }
}

.footer-sep {
  color: $text-muted;
  font-size: 12px;
}

.footer-copy {
  margin: 0;
  font-size: 12px;
  color: $text-muted;
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
