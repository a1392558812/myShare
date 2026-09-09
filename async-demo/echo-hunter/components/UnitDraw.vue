<template>
  <div class="unit-panel">
    <button class="back" @click="$emit('back')">返回</button>
    <h1 class="title">深海生物图鉴</h1>
    <p class="sub">游到它们身边看看——哪些能成为你的盘中餐，哪些会要你的命。</p>

    <section class="group">
      <h2 class="group-title eat"><span class="dot"></span>可食用 · 对你有益</h2>
      <div class="grid">
        <UnitCard
          v-for="u in edibleUnits"
          :key="u.name"
          :unit="u"
        />
      </div>
    </section>

    <section class="group">
      <h2 class="group-title danger"><span class="dot"></span>不可食用 · 危险</h2>
      <div class="grid">
        <UnitCard
          v-for="u in dangerUnits"
          :key="u.name"
          :unit="u"
        />
      </div>
    </section>

    <p class="tip">若分不清眼前发光的是什么，就主动发一次声呐重置恐惧倒计时，或右键冲刺加速，再慢慢靠近观察。</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UnitCard from './UnitCard.vue';

const edibleUnits = ref([]);
const dangerUnits = ref([]);

defineEmits(['back']);

// 单位定义
const UNIT_DEFS = {
  // 可食用
  krill: {
    name: '磷虾',
    sprite: 'krill',
    color: 'krill',
    px: 2,
    ring: 14,
    size: 96,
    desc: '你的主要食物与通关目标。吃掉可以补充一点能量，集齐全部磷虾，深海的出口漩涡就会开启。',
  },
  fish: {
    name: '小鱼',
    sprite: 'fish',
    color: 'fish',
    px: 2,
    size: 96,
    desc: '散布在开阔水域的小零嘴。每吃掉 10 条，就会得到一次能量 + 血量奖励。',
  },
  heal: {
    name: '医疗珊瑚',
    sprite: 'heal',
    color: 'heal',
    px: 3,
    ring: 14,
    size: 96,
    desc: '粉色的治愈道具，吃掉回复 1 点生命。',
  },
  energy: {
    name: '回声能量',
    sprite: 'energy',
    color: 'energy',
    px: 3,
    ring: 14,
    size: 96,
    desc: '翠绿的能量团，吃掉立即回复大量声呐能量（40 点），让你能多喊几嗓子。',
  },

  // 不可食用
  puffer: {
    name: '河豚',
    sprite: 'puffer',
    color: 'puffer',
    px: 3,
    ring: 14,
    size: 96,
    desc: '长满毒刺，看着是陷阱不是食物。碰到会掉 1 点血，别被它的颜色骗了。',
  },
  monster: {
    name: '海怪',
    sprite: 'monster',
    color: 'danger',
    px: 4,
    ring: 28,
    size: 96,
    desc: '致命的猎手。你的声呐会暴露位置，把它引来追杀你；一旦被撞到就掉 1 点血。',
  },
  barnacle: {
    name: '毒液藤壶',
    sprite: 'barnacle',
    color: 'barnacle',
    px: 2,
    ring: 12,
    size: 96,
    desc: '依附在洞壁上的毒囊，碰到会中毒掉 1 点血。靠近墙时请绕开这些紫色疙瘩。',
  },
};

const classify = () => {
  edibleUnits.value = ['krill', 'fish', 'heal', 'energy'].map((k) => ({ ...UNIT_DEFS[k], edible: true }));
  dangerUnits.value = ['puffer', 'monster', 'barnacle'].map((k) => ({ ...UNIT_DEFS[k], edible: false }));
};

classify();
</script>

<style scoped lang="scss">
.unit-panel {
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px 40px;
  background: #020409;
  color: #eaf6ff;
  box-sizing: border-box;

  .back {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    cursor: pointer;
  }
}

.title {
  margin: 8px 0 0;
  font-size: 26px;
  letter-spacing: 4px;
  color: #3ee6d8;
  text-align: center;
}

.sub {
  margin: 8px 0 28px;
  text-align: center;
  font-size: 13px;
  color: #6a7c8d;
}

.group {
  margin: 0 auto 34px;
  max-width: 860px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 16px;
  letter-spacing: 2px;

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
  }

  &.eat .dot {
    background: #3ee6d8;
    box-shadow: 0 0 8px #3ee6d8;
  }

  &.danger .dot {
    background: #ff3b4d;
    box-shadow: 0 0 8px #ff3b4d;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.tip {
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
  font-size: 13px;
  color: #6a7c8d;
}
</style>
