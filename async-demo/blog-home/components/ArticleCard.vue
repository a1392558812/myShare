<template>
  <article class="article-card" :style="{ animationDelay: index * 0.08 + 's' }">
    <div class="card-brass-frame"></div>
    <span class="card-rivet rivet-tl"></span>
    <span class="card-rivet rivet-tr"></span>
    <span class="card-rivet rivet-bl"></span>
    <span class="card-rivet rivet-br"></span>

    <span class="edge-rivet edge-rivet-top-1"></span>
    <span class="edge-rivet edge-rivet-top-2"></span>
    <span class="edge-rivet edge-rivet-bottom-1"></span>
    <span class="edge-rivet edge-rivet-bottom-2"></span>

    <div class="copper-pipe copper-pipe-left"></div>
    <div class="copper-pipe copper-pipe-right"></div>

    <svg class="card-gear card-gear-top" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="10" fill="none" :stroke="article.accent" stroke-width="2.5" opacity="0.5" />
      <g :stroke="article.accent" stroke-width="2" opacity="0.45">
        <line x1="24" y1="6" x2="24" y2="13" />
        <line x1="24" y1="35" x2="24" y2="42" />
        <line x1="6" y1="24" x2="13" y2="24" />
        <line x1="35" y1="24" x2="42" y2="24" />
        <line x1="11.3" y1="11.3" x2="16.2" y2="16.2" />
        <line x1="31.8" y1="31.8" x2="36.7" y2="36.7" />
        <line x1="11.3" y1="36.7" x2="16.2" y2="31.8" />
        <line x1="31.8" y1="16.2" x2="36.7" y2="11.3" />
      </g>
      <circle cx="24" cy="24" r="4" :fill="article.accent" opacity="0.35" />
    </svg>

    <div class="article-cover" v-if="article.cover">
      <div class="cover-placeholder">
        <div class="cover-overlay"></div>
        <div class="cover-scanline"></div>
        <span class="cover-tag">{{ article.category }}</span>
        <span class="cover-icon" :style="{ background: article.coverGradient }">{{ article.coverIcon }}</span>
      </div>
    </div>

    <div class="article-body">

      <div class="steampunk-divider">
        <span class="divider-gear left">&#9881;</span>
        <span class="divider-line"></span>
        <span class="divider-diamond">&#9670;</span>
        <span class="divider-line"></span>
        <span class="divider-gear right">&#9881;</span>
      </div>

      <div class="article-meta-top">
        <span class="article-category" :style="{ color: article.accent }">
          {{ article.category }}
        </span>
        <span class="article-date-gauge">
          <span class="gauge-needle" :style="{ background: article.accent }"></span>
          {{ article.date }}</span>
      </div>

      <h2 class="article-title">
        <a href="#">{{ article.title }}</a>
      </h2>
      <p class="article-excerpt">{{ article.excerpt }}</p>

      <div class="nameplate-sep">
        <span class="nameplate-dot"></span>
        <span class="nameplate-line"></span>
        <span class="nameplate-dot"></span>
      </div>

      <div class="article-meta-bottom">
        <div class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="article-tag">#{{ tag }}</span>
        </div>
        <div class="article-stats">
          <span class="stat-item">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor"
                stroke-width="2" />
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            {{ article.views }}
          </span>
          <span class="stat-item">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor"
                stroke-width="2" />
            </svg>
            {{ article.comments }}
          </span>
          <span class="stat-item">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            {{ article.likes }}
          </span>
        </div>
      </div>

      <div class="article-footer">
        <div class="author-mini">
          <span class="author-avatar-sm av-steampunk" :style="{ '--av-color': article.authorColor }">
            {{ article.author[0] }}
          </span>
          <span class="author-name-sm">{{ article.author }}</span>
        </div>
        <a href="#" class="read-more">
          <span class="read-more-text">阅读全文</span>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </div>

    <div class="steam-effect">
      <span class="steam-particle steam-1"></span>
      <span class="steam-particle steam-2"></span>
      <span class="steam-particle steam-3"></span>
      <span class="steam-particle steam-4"></span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  article: { type: Object, required: true },
  index: { type: Number, default: 0 }
})
</script>

<style lang="scss" scoped>
$bili-pink: #FB7299;
$steampunk-brass: #c9a96e;
$steampunk-brass-light: #e0c88e;
$steampunk-brass-dark: #a08040;
$steampunk-copper: #b87333;
$text-bright: #f5eee0;
$text-secondary: #b8a99a;
$text-muted: #7a6e62;

.article-card {
  position: relative;
  background: linear-gradient(175deg, #2a2332 0%, #221e2a 30%, #2a2332 100%);
  border: 1px solid rgba(201, 169, 110, 0.18);
  border-radius: 0;
  overflow: visible;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardSlideIn 0.6s ease both;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201, 169, 110, 0.015) 2px, rgba(201, 169, 110, 0.015) 4px);
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $steampunk-brass, $steampunk-brass-dark, transparent);
    opacity: 0.5;
    z-index: 1;
    transition: all 0.5s ease;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: $steampunk-brass;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 0 2px rgba(201, 169, 110, 0.2),
      0 0 30px rgba(201, 169, 110, 0.12),
      0 0 60px rgba(251, 114, 153, 0.06),
      inset 0 0 60px rgba(201, 169, 110, 0.03);

    &::after {
      height: 3px;
      opacity: 0.8;
      background: linear-gradient(90deg, transparent, $steampunk-brass-light, $bili-pink, $steampunk-brass-light, transparent);
    }

    .card-brass-frame {
      border-color: rgba(201, 169, 110, 0.7);
    }

    .card-rivet {
      box-shadow: 0 0 8px rgba(201, 169, 110, 0.8), 0 0 2px rgba(201, 169, 110, 0.6);
    }

    .copper-pipe::before {
      opacity: 0.4;
    }

    .steam-effect {
      opacity: 1;
    }

    .card-gear-top {
      opacity: 0.55;
    }

    .card-gear-top circle {
      stroke-dashoffset: 0;
    }
  }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-brass-frame {
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(201, 169, 110, 0.15);
  pointer-events: none;
  z-index: 0;
  transition: border-color 0.5s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid rgba(201, 169, 110, 0.06);
  }
}

.card-rivet {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 35% 35%, $steampunk-brass-light, $steampunk-brass-dark);
  border-radius: 50%;
  z-index: 3;
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
  top: -4px;
  left: -4px;
}

.rivet-tr {
  top: -4px;
  right: -4px;
}

.rivet-bl {
  bottom: -4px;
  left: -4px;
}

.rivet-br {
  bottom: -4px;
  right: -4px;
}

.edge-rivet {
  position: absolute;
  width: 5px;
  height: 5px;
  background: radial-gradient(circle at 35% 35%, $steampunk-copper, darken($steampunk-copper, 20%));
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 3px rgba(184, 115, 51, 0.5);

  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.3);
  }
}

.edge-rivet-top-1 {
  top: -2.5px;
  left: 18%;
}

.edge-rivet-top-2 {
  top: -2.5px;
  right: 18%;
}

.edge-rivet-bottom-1 {
  bottom: -2.5px;
  left: 18%;
}

.edge-rivet-bottom-2 {
  bottom: -2.5px;
  right: 18%;
}

.copper-pipe {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  z-index: 1;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: 16px 0;
    background: linear-gradient(180deg, transparent 0%, rgba(184, 115, 51, 0.08) 5%, rgba(184, 115, 51, 0.25) 20%, rgba(184, 115, 51, 0.35) 50%, rgba(184, 115, 51, 0.25) 80%, rgba(184, 115, 51, 0.08) 95%, transparent 100%);
    border-radius: 2px;
    opacity: 0.2;
    transition: opacity 0.5s ease;
    box-shadow: inset 0 0 4px rgba(184, 115, 51, 0.3), 0 0 6px rgba(184, 115, 51, 0.1);
  }
}

.copper-pipe-left {
  left: 20px;
}

.copper-pipe-right {
  right: 20px;
}

.card-gear {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  color: $steampunk-brass-dark;
}

.card-gear-top {
  top: 8px;
  right: 14px;
  width: 38px;
  height: 38px;
  opacity: 0.3;
  animation: gearSpin 20s linear infinite;
  transition: opacity 0.5s ease;
}

@keyframes gearSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.article-cover {
  height: 200px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 20%, rgba(201, 169, 110, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(251, 114, 153, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

.cover-scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.06) 2px, rgba(0, 0, 0, 0.06) 4px);
  pointer-events: none;
  z-index: 1;
}

.cover-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 14px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 2px;
  font-size: 11px;
  color: $steampunk-brass-light;
  letter-spacing: 2px;
  z-index: 2;
  text-transform: uppercase;
}

.cover-icon {
  font-size: 56px;
  opacity: 0.35;
  filter: blur(3px);
  position: relative;
  z-index: 0;
}

.article-body {
  padding: 18px 28px 20px;
  position: relative;
  z-index: 2;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.article-category {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.02);
}

.steampunk-divider {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 14px;
  height: 20px;
}

.divider-gear {
  font-size: 12px;
  color: $steampunk-brass;

  &.left {
    animation: gearSpin 6s linear infinite;
  }

  &.right {
    animation: gearSpin 6s linear infinite reverse;
  }
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, $steampunk-brass, rgba(201, 169, 110, 0.1));
  margin: 0 6px;
}

.divider-diamond {
  font-size: 6px;
  color: $steampunk-brass;
  opacity: 0.6;
}

.article-date-gauge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-family: 'Orbitron', monospace;
  color: $text-muted;
  letter-spacing: 1px;
}

.gauge-needle {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  animation: gaugePulse 2s ease-in-out infinite;
}

@keyframes gaugePulse {

  0%,
  100% {
    box-shadow: 0 0 4px currentColor;
  }

  50% {
    box-shadow: 0 0 10px currentColor, 0 0 16px currentColor;
  }
}

.nameplate-sep {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.nameplate-dot {
  width: 4px;
  height: 4px;
  background: $steampunk-brass;
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(201, 169, 110, 0.5);
}

.nameplate-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(201, 169, 110, 0.4), rgba(201, 169, 110, 0.05));
}

.article-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;

  a {
    color: $text-bright;
    transition: color 0.3s ease;

    &:hover {
      color: $bili-pink;
    }
  }
}

.article-excerpt {
  margin: 0 0 14px;
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-tag {
  font-size: 11px;
  color: $bili-pink;
  background: rgba(251, 114, 153, 0.07);
  padding: 3px 10px;
  border: 1px solid rgba(251, 114, 153, 0.12);
  border-radius: 2px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(251, 114, 153, 0.15);
    border-color: rgba(251, 114, 153, 0.3);
  }
}

.article-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: $text-muted;
  font-family: 'Orbitron', monospace;

  svg {
    opacity: 0.4;
  }
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-mini {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border: 2px solid rgba(201, 169, 110, 0.3);

  &.av-steampunk {
    background: var(--av-color, #c9a96e);
    border: 2px solid $steampunk-brass;
    box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 0 8px rgba(201, 169, 110, 0.3);
  }
}

.author-name-sm {
  font-size: 13px;
  color: $text-secondary;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $steampunk-brass-light;
  padding: 6px 16px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 2px;
  background: rgba(201, 169, 110, 0.03);
  transition: all 0.3s ease;

  .read-more-text {
    letter-spacing: 1px;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover {
    color: $bili-pink;
    border-color: $bili-pink;
    background: rgba(251, 114, 153, 0.08);
    box-shadow: 0 0 16px rgba(251, 114, 153, 0.15);

    svg {
      transform: translateX(4px);
    }
  }
}

.steam-effect {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 10;
  overflow: hidden;
}

.steam-particle {
  position: absolute;
  bottom: -10px;
  width: 40px;
  height: 60px;
  background: radial-gradient(ellipse at center, rgba(201, 169, 110, 0.12) 0%, rgba(251, 114, 153, 0.05) 40%, transparent 70%);
  border-radius: 50%;
  filter: blur(8px);
  z-index: 10;
}

.steam-1 {
  left: 8%;
  animation: steamRise 3s ease-in-out infinite;
}

.steam-2 {
  left: 28%;
  animation: steamRise 3.5s ease-in-out 0.5s infinite;
}

.steam-3 {
  left: 55%;
  animation: steamRise 2.8s ease-in-out 1s infinite;
}

.steam-4 {
  left: 75%;
  animation: steamRise 3.2s ease-in-out 0.3s infinite;
}

@keyframes steamRise {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }

  20% {
    opacity: 0.7;
  }

  60% {
    opacity: 0.4;
  }

  100% {
    transform: translateY(-80px) scale(2.5);
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .article-title {
    font-size: 17px;
  }

  .article-meta-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .article-stats {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
