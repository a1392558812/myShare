<template>
  <div class="start-panel">
    <div class="start-content">
      <h1 class="game-title">🎮 Roguelike 冒险</h1>
      <p class="game-subtitle">肉鸽射击游戏</p>

      <div class="button-row">
        <button class="start-button" @click="$emit('start')">
          <span class="button-text">开始游戏</span>
        </button>
        <button
          class="placeholder-btn"
          title="即将上线"
          @click="alertFun('即将上线')"
        >
          <span class="button-text">设置</span>
        </button>
      </div>

      <div class="info-section">
        <div class="instructions">
          <h3>操作说明</h3>
          <div class="instruction-list">
            <div class="instruction-item">
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
          <h3>游戏特色</h3>
          <ul>
            <li>随机技能组合，每次游戏都不同</li>
            <li>精英敌人系统，挑战你的操作</li>
            <li>击杀敌人掉落宝物与装备</li>
            <li>魔法技能，华丽视觉特效</li>
            <li>线性成长，越玩越强</li>
          </ul>
        </div>
      </div>

      <div class="bottom-actions">
        <button class="ghost-btn" @click="showDocs = true">需求文档</button>
        <button class="ghost-btn" @click="showGuide = true">新手指导</button>
        <button
          class="ghost-btn"
          title="即将上线"
          @click="alertFun('即将上线')"
        >
          🏆 排行榜
        </button>
      </div>

      <div v-if="showDocs" class="modal-overlay" @click.self="showDocs = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>📋 需求文档</h2>
            <button class="close-btn" @click="showDocs = false">✕</button>
          </div>
          <div class="modal-body">
            <markdownFn :text="markdownStr" />
          </div>
        </div>
      </div>

      <div
        v-if="showGuide"
        class="modal-overlay"
        @click.self="showGuide = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>📖 新手指导</h2>
            <button class="close-btn" @click="showGuide = false">✕</button>
          </div>
          <div class="modal-body">
            <markdownFn :text="guideStr" />
          </div>
        </div>
      </div>
    </div>

    <div class="particles">
      <div
        class="particle"
        v-for="i in 20"
        :key="i"
        :style="getParticleStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
defineEmits(["start"]);

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: null,
  },
});

const showDocs = ref(false);
const showGuide = ref(false);

const markdownFn = props.markdownComponent();

const markdownStr = ref("加载中...");
const guideStr = ref("加载中...");

const loadDocs = async () => {
  try {
    const response = await fetch("./async-demo/roguelike/README.md");
    const text = await response.text();
    markdownStr.value = text;
  } catch (error) {
    console.error("加载需求文档失败:", error);
    markdownStr.value = "加载失败，请检查文件路径";
  }
};

const loadGuide = async () => {
  try {
    const response = await fetch("./async-demo/roguelike/guide.md");
    const text = await response.text();
    guideStr.value = text;
  } catch (error) {
    console.error("加载新手指导失败:", error);
    guideStr.value = "加载失败，请检查文件路径";
  }
};

const alertFun = (text) => alert(text);

onMounted(() => {
  loadDocs();
  loadGuide();
});

const getParticleStyle = (i) => {
  const size = 2 + Math.random() * 4;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 20}s`,
    animationDuration: `${15 + Math.random() * 10}s`,
  };
};
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
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
      0%,
      100% {
        filter: brightness(1);
      }
      50% {
        filter: brightness(1.3);
      }
    }
  }

  .game-subtitle {
    font-size: 18px;
    color: #94a3b8;
    margin-bottom: 36px;
    letter-spacing: 4px;
  }

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

    .button-text {
      font-weight: 600;
      letter-spacing: 2px;
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 40px rgba(59, 130, 246, 0.6);
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .placeholder-btn {
    font-size: 14px;
    padding: 14px 28px;
    background: rgba(30, 41, 59, 0.8);
    color: #64748b;
    border: 1px dashed rgba(100, 116, 139, 0.4);
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    &[disabled] {
      cursor: not-allowed;
    }

    .button-text {
      letter-spacing: 1px;
    }
  }

  .info-section {
    display: flex;
    gap: 40px;
    text-align: left;
    max-width: 700px;
    margin: 0 auto;
  }

  .instructions,
  .features {
    flex: 1;
    min-width: 260px;

    h3 {
      margin-bottom: 14px;
      font-size: 16px;
    }
  }

  .instructions h3 {
    color: #fbbf24;
  }
  .features h3 {
    color: #a78bfa;
  }

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
      font-family: "Consolas", monospace;
    }

    .instruction-text {
      font-size: 13px;
      color: #cbd5e1;
    }
  }

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
        content: "▸";
        position: absolute;
        left: 0;
        color: #a78bfa;
      }
    }
  }

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
    letter-spacing: 1px;
    transition: all 0.2s;
    cursor: pointer;
    &[disabled] {
      cursor: not-allowed;
    }
  }
}

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
      0% {
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) scale(1);
        opacity: 0;
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 16px;
  width: 90vw;
  min-width: 900px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  text-align: left;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);

  h2 {
    font-size: 24px;
    color: #e2e8f0;
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.8;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.5);
    border-radius: 4px;

    &:hover {
      background: rgba(100, 116, 139, 0.7);
    }
  }
}
</style>
</template>