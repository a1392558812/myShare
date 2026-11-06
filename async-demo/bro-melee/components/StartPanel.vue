<template>
  <div class="start-panel">
    <div class="title-block">
      <div class="title">兄弟大乱斗</div>
      <div class="tagline">是兄弟就砍我 —— 无限江湖，人人皆敌，杀一人吞一级。</div>
    </div>

    <div class="content">
      <div class="column">
        <div class="column-title">操作</div>
        <div class="key-row"><span class="key">W A S D</span><span class="key-desc">移动，方向键同样可用</span></div>
        <div class="key-row"><span class="key">鼠标</span><span class="key-desc">瞄准，左键或 J 普攻</span></div>
        <div class="key-row"><span class="key">空格 / 右键</span><span class="key-desc">闪避冲刺，短暂无敌</span></div>
        <div class="key-row"><span class="key">1 - 5</span><span class="key-desc">释放已学的外功</span></div>
      </div>

      <div class="column">
        <div class="column-title">江湖规矩</div>
        <div class="rule">击败敌人可吞噬其修为，等级越高收益越大。</div>
        <div class="rule">每升 5 级，从三本秘籍中择一：外功、内功、轻功。</div>
        <div class="rule">敌人也会互相厮杀、抢经验书、残血逃命。</div>
        <div class="rule">刷新的敌人等级随你浮动，永远有人比你强，也永远有人给你打。</div>
      </div>
    </div>

    <div class="button-row">
      <button class="ghost-btn" @click="$emit('start', 'normal')">踏入江湖</button>
      <button class="ghost-btn" @click="$emit('keybinds')">键位设置</button>
      <button class="ghost-btn" @click="$emit('gallery')">角色图鉴</button>
      <button class="ghost-btn" @click="$emit('adventure')">查看奇遇</button>
      <button class="ghost-btn" @click="$emit('docs')">需求文档</button>
      <button class="ghost-btn" @click="$emit('code')">查看源码</button>
    </div>

    <div class="nightmare-config">
      <span class="config-label">噩梦难度</span>
      <div class="stepper">
        <button class="step-btn" type="button" @click="adjustNightmareLevel(-1)">−</button>
        <input
          class="level-input"
          type="number"
          min="1"
          max="30"
          v-model.number="nightmareLevel"
          @input="clampNightmareLevel"
        />
        <button class="step-btn" type="button" @click="adjustNightmareLevel(1)">＋</button>
      </div>
      <button class="ghost-btn ghost-btn--nightmare" type="button" @click="enterNightmare">
        进入噩梦 {{ nightmareLevel }}
      </button>
    </div>

    <div class="mode-note">
      噩梦难度 1~30 可选：难度越高，一击秒杀抬升的敌人等级越多（噩梦 N 每次抬升 N 倍动态压力，封顶 N×10 级）。普通模式不触发动态压力。
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['start', 'docs', 'code', 'gallery', 'keybinds']);

const NIGHTMARE_MIN = 1;
const NIGHTMARE_MAX = 30;
const nightmareLevel = ref(1);

/** 把输入夹到 [1, 30] 闭区间并取整 */
const clampNightmareLevel = () => {
  let value = Math.floor(Number(nightmareLevel.value));
  if (!Number.isFinite(value) || value < NIGHTMARE_MIN) {
    value = NIGHTMARE_MIN;
  }
  if (value > NIGHTMARE_MAX) {
    value = NIGHTMARE_MAX;
  }
  nightmareLevel.value = value;
};

/** 点 −/＋ 按钮时步进并夹紧 */
const adjustNightmareLevel = (delta) => {
  clampNightmareLevel();
  nightmareLevel.value = Math.min(NIGHTMARE_MAX, Math.max(NIGHTMARE_MIN, nightmareLevel.value + delta));
};

/** 进入噩梦：把选中的难度一并传给父级 */
const enterNightmare = () => {
  clampNightmareLevel();
  emit('start', 'nightmare', nightmareLevel.value);
};
</script>

<style scoped lang="scss">
.start-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #191b11;
  color: #f4ecd8;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.title-block {
  text-align: center;
  z-index: 1;
}

.title {
  font-size: 46px;
  letter-spacing: 14px;
  text-indent: 14px;
  color: #ffe9b8;
  text-shadow: 0 0 34px rgba(255, 209, 102, 0.35);
}

.tagline {
  margin-top: 18px;
  font-size: 14px;
  letter-spacing: 2px;
  color: rgba(244, 236, 216, 0.55);
}

.content {
  display: flex;
  gap: 56px;
  margin-top: 44px;
  z-index: 1;
}

.column {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-title {
  font-size: 12px;
  letter-spacing: 6px;
  color: #c6a86c;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(198, 168, 108, 0.25);
}

.key-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.key {
  min-width: 92px;
  padding: 3px 8px;
  text-align: center;
  font-size: 11px;
  color: #8ef0d5;
  border: 1px solid rgba(142, 240, 213, 0.35);
  border-radius: 2px;
}

.key-desc {
  color: rgba(244, 236, 216, 0.55);
}

.rule {
  font-size: 12px;
  line-height: 1.85;
  color: rgba(244, 236, 216, 0.55);
  padding-left: 10px;
  border-left: 2px solid rgba(224, 85, 69, 0.4);
}

.button-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  z-index: 1;
}

.ghost-btn {
  padding: 7px 20px;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(198, 168, 108, 0.75);
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.3);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ffe9b8;
    border-color: rgba(198, 168, 108, 0.7);
  }
}

.ghost-btn--nightmare {
  color: rgba(255, 138, 122, 0.9);
  border-color: rgba(224, 85, 69, 0.55);
  background: rgba(224, 85, 69, 0.08);

  &:hover {
    color: #ffd0c6;
    border-color: #e05545;
    background: rgba(224, 85, 69, 0.18);
  }
}

.nightmare-config {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  z-index: 1;
}

.config-label {
  font-size: 12px;
  letter-spacing: 4px;
  color: rgba(255, 138, 122, 0.85);
}

.stepper {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(224, 85, 69, 0.4);
  border-radius: 2px;
  overflow: hidden;
}

.step-btn {
  width: 28px;
  font-size: 14px;
  color: #ffd0c6;
  background: rgba(224, 85, 69, 0.1);
  border: none;
  cursor: pointer;

  &:hover {
    background: rgba(224, 85, 69, 0.28);
  }
}

.level-input {
  width: 46px;
  padding: 4px 0;
  text-align: center;
  font-size: 14px;
  color: #ffe9b8;
  background: rgba(10, 12, 9, 0.6);
  border: none;
  border-left: 1px solid rgba(224, 85, 69, 0.4);
  border-right: 1px solid rgba(224, 85, 69, 0.4);
  /* 去掉数字输入框默认的上下箭头，保持风格统一 */
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    background: rgba(224, 85, 69, 0.12);
  }
}

.mode-note {
  margin-top: 12px;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.3);
  z-index: 1;
}
</style>
