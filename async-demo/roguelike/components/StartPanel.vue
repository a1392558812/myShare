<template>
  <div class="start-panel">
    <div class="start-content">
      <!-- 标题区 -->
      <h1 class="game-title">🎮 Roguelike 冒险</h1>
      <p class="game-subtitle">肉鸽射击游戏</p>

      <!-- 按钮行（居中） -->
      <div class="button-row">
        <button class="start-button" @click="$emit('start')">
          <span class="button-text">开始游戏</span>
          <span class="button-icon">⚔️</span>
        </button>
        <!-- 占位按钮：后续可启用 -->
        <button class="placeholder-btn" disabled title="即将上线">
          <span class="button-icon">⚙️</span>
          <span class="button-text">设置</span>
        </button>
      </div>

      <!-- 信息区：左侧操作说明 + 右侧游戏特色 -->
      <div class="info-section">
        <div class="instructions">
          <h3>📖 操作说明</h3>
          <div class="instruction-list">
            <div class="instruction-item">
              <span class="instruction-key">🖱️</span>
              <span class="instruction-text">鼠标瞄准，点击射击</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-key">W A S D</span>
              <span class="instruction-text">移动角色</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-key">按住鼠标</span>
              <span class="instruction-text">快速射击</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-key">~</span>
              <span class="instruction-text">打开调试面板</span>
            </div>
          </div>
        </div>

        <div class="features">
          <h3>✨ 游戏特色</h3>
          <ul>
            <li>🎲 随机技能组合，每次游戏都不同</li>
            <li>👹 精英敌人系统，挑战你的操作</li>
            <li>💎 击杀敌人掉落宝物与装备</li>
            <li>🔮 魔法技能，华丽视觉特效</li>
            <li>⬆️ 线性成长，越玩越强</li>
          </ul>
        </div>
      </div>

      <!-- 底部预留按钮区 -->
      <div class="bottom-actions">
        <button class="ghost-btn" disabled title="即将上线">
          🏆 排行榜
        </button>
        <button class="ghost-btn" disabled title="即将上线">
          📜 更新日志
        </button>
      </div>
    </div>

    <!-- 背景粒子效果 -->
    <div class="particles">
      <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start'])

// 生成随机粒子样式
const getParticleStyle = (i) => {
  const size = 2 + Math.random() * 4
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 20}s`,
    animationDuration: `${15 + Math.random() * 10}s`,
  }
}
</script>

<style scoped lang="scss">
.start-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
}

.start-content {
  text-align: center;
  color: #e2e8f0;
  z-index: 10;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .game-title {
    font-size: 52px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleGlow 3s ease-in-out infinite;

    @keyframes titleGlow {
      0%, 100% { filter: brightness(1); }
      50%      { filter: brightness(1.3); }
    }
  }

  .game-subtitle {
    font-size: 18px;
    color: #94a3b8;
    margin-bottom: 36px;
    letter-spacing: 4px;
  }

  // ─── 按钮行 ───
  .button-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 40px;
  }

  .start-button {
    font-size: 18px;
    padding: 14px 60px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);

    .button-text { font-weight: 600; letter-spacing: 2px; }
    .button-icon { font-size: 22px; animation: iconBounce 1s ease-in-out infinite; }

    @keyframes iconBounce {
      0%, 100% { transform: translateX(0); }
      50%      { transform: translateX(5px); }
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 40px rgba(59, 130, 246, 0.6);
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
    }

    &:active { transform: scale(0.98); }
  }

  // 占位按钮
  .placeholder-btn {
    font-size: 14px;
    padding: 14px 28px;
    background: rgba(30, 41, 59, 0.8);
    color: #64748b;
    border: 1px dashed rgba(100, 116, 139, 0.4);
    border-radius: 10px;
    cursor: not-allowed;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    .button-icon { font-size: 16px; opacity: 0.7; }
    .button-text { letter-spacing: 1px; }
  }

  // ─── 信息区（左右两栏）──
  .info-section {
    display: flex;
    gap: 40px;
    text-align: left;
    max-width: 700px;
    margin: 0 auto;
  }

  .instructions, .features {
    flex: 1;
    min-width: 260px;

    h3 {
      margin-bottom: 14px;
      font-size: 16px;
    }
  }

  .instructions h3 { color: #fbbf24; }
  .features h3  { color: #a78bfa; }

  // 操作说明列表
  .instruction-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .instruction-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 13px;
    background: rgba(30, 41, 59, 0.55);
    border-radius: 8px;
    border: 1px solid rgba(100, 116, 139, 0.2);

    .instruction-key {
      font-size: 15px;
      min-width: 72px;
      color: #60a5fa;
      font-weight: 600;
      font-family: 'Consolas', monospace;
    }

    .instruction-text {
      font-size: 13px;
      color: #cbd5e1;
    }
  }

  // 游戏特色列表
  .features ul {
    list-style: none;
    padding: 0;

    li {
      margin: 9px 0;
      font-size: 13px;
      color: #94a3b8;
      padding-left: 18px;
      position: relative;

      &::before {
        content: '▸';
        position: absolute;
        left: 0;
        color: #a78bfa;
      }
    }
  }

  // ─── 底部占位按钮区 ───
  .bottom-actions {
    margin-top: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .ghost-btn {
    font-size: 13px;
    padding: 8px 20px;
    background: transparent;
    color: #475569;
    border: 1px dashed rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    cursor: not-allowed;
    letter-spacing: 1px;
    transition: all 0.2s;
  }
}

// 背景粒子效果
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .particle {
    position: absolute;
    background: rgba(96, 165, 250, 0.5);
    border-radius: 50%;
    animation: float linear infinite;

    @keyframes float {
      0%   { transform: translateY(100vh) scale(0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(-100vh) scale(1); opacity: 0; }
    }
  }
}
</style>
