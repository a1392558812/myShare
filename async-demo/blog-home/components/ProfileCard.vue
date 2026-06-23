<template>
  <div class="profile-card">
    <span class="card-rivet rivet-tl"></span>
    <span class="card-rivet rivet-tr"></span>
    <span class="card-rivet rivet-bl"></span>
    <span class="card-rivet rivet-br"></span>

    <div class="profile-avatar-wrapper">
      <div class="profile-avatar">
        <div class="avatar-circle">
          <span class="avatar-text">Awen</span>
        </div>
        <div class="avatar-orbital"></div>
      </div>
    </div>

    <h3 class="profile-name">牢Awen</h3>
    <p class="profile-bio">
      热爱一切与代码相关的事物。专注于前端技术探索，喜欢折腾新框架，沉迷 CSS 艺术。
      你所热爱的，就是你的生活。
    </p>

    <div class="profile-stats">
      <div class="stat-box">
        <span class="stat-num">128</span>
        <span class="stat-label">文章</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">3.2k</span>
        <span class="stat-label">粉丝</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">56k</span>
        <span class="stat-label">阅读</span>
      </div>
    </div>

    <div class="profile-social">
      <a href="#" class="social-link" title="GitHub">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <a href="#" class="social-link" title="掘金">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 8h10M7 12h10M7 16h6" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" />
        </svg>
      </a>
      <a href="#" class="social-link" title="知乎">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5" /><text x="12" y="17"
            text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">知</text>
        </svg>
      </a>
      <a href="#" class="social-link" title="Bilibili">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M9 8v8M12 8v8M15 8v8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$bili-pink: #FB7299;
$steampunk-brass: #c9a96e;
$border-color: rgba(201, 169, 110, 0.25);
$text-bright: #f5eee0;
$text-secondary: #b8a99a;
$text-muted: #7a6e62;
$bg-sidebar: #241f2d;

.profile-card {
  position: relative;
  background: $bg-sidebar;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 32px 24px 24px;
  text-align: center;
  transition: border-color 0.4s ease;

  &:hover {
    border-color: $steampunk-brass;
  }
}

.card-rivet {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 35% 35%, #e0c88e, #a08040);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(201, 169, 110, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2);
  transition: all 0.5s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.3);
  }
}

.rivet-tl {
  top: 8px;
  left: 8px;
}

.rivet-tr {
  top: 8px;
  right: 8px;
}

.rivet-bl {
  bottom: 8px;
  left: 8px;
}

.rivet-br {
  bottom: 8px;
  right: 8px;
}

.profile-avatar-wrapper {
  margin-bottom: 16px;
}

.profile-avatar {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto;
}

.avatar-circle {
  width: calc(100% - 3px * 2);
  height: calc(100% - 3px * 2);
  border-radius: 50%;
  background: linear-gradient(135deg, $bili-pink, $steampunk-brass);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid $steampunk-brass;
  box-shadow: 0 0 20px rgba(201, 169, 110, 0.2), 0 0 40px rgba(251, 114, 153, 0.1);
  position: relative;
  z-index: 1;
}

.avatar-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.avatar-orbital {
  position: absolute;
  inset: -12px;
  border: 2px dashed rgba(201, 169, 110, 0.3);
  border-radius: 50%;
  animation: gearSpin 10s linear infinite;
  left: -12px;
  top: -12px;
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.profile-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: $text-bright;
}

.profile-bio {
  margin: 0 0 20px;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.7;
}

.profile-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 14px 0;
  margin-bottom: 18px;
  background: rgba(42, 36, 51, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(201, 169, 110, 0.12);
}

.stat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: $bili-pink;
}

.stat-label {
  font-size: 11px;
  color: $text-muted;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(201, 169, 110, 0.2);
}

.profile-social {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  background: rgba(42, 36, 51, 0.5);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: $bili-pink;
    border-color: $bili-pink;
    background: rgba(251, 114, 153, 0.1);
    box-shadow: 0 0 12px rgba(251, 114, 153, 0.2);
  }
}
</style>
