<template>
  <div class="bro-melee">
    <StartPanel v-if="panel === 'start'" @start="onStart" @docs="onDocs('./async-demo/bro-melee/README.md')"
      @code="onCode" @gallery="onGallery" @adventure="onDocs('./async-demo/bro-melee/add.md')"
      @keybinds="panel = 'keybinds'" />
    <GameMain v-else-if="panel === 'game'" :key="gameKey" :mode="gameMode" @restart="onBack" />
    <div v-else-if="panel === 'keybinds'" class="keybind-host">
      <KeybindPanel :skills="preGameSkills" :keybinds="preKeybinds" :awaiting="awaitingKeybind"
        :display-of="displayOfPre" @close="panel = 'start'" @await="awaitingKeybind = $event"
        @clear="preKeybinds = unbindKey(preKeybinds, $event)" @reset="preKeybinds = clearKeybinds()" />
    </div>
    <CharacterGallery v-else-if="panel === 'gallery'" @back="onBack" />
    <CodePanel v-else-if="panel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      @restart="onBack" />
    <div v-else-if="['docs', 'adventure'].includes(panel)" class="docs-panel">
      <button class="docs-back" @click="onBack">返回</button>
      <markdownFn v-if="docsText" :text="docsText" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPanel from './components/StartPanel.vue';
import GameMain from './components/GameMain.vue';
import CharacterGallery from './components/CharacterGallery.vue';
import KeybindPanel from './components/KeybindPanel.vue';
import CodePanel from '../components/code-panel/index.vue';
import { PLAYER_SKILLS } from './config/skills.js';
import {
  bindKey as bindKeyBase,
  clearKeybinds,
  keybindCodeLabel,
  readKeybinds,
  unbindKey,
} from './core/keybinds.js';

const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  markdownComponent: {
    type: Function,
    default: () => { },
  },
});

const markdownFn = props.markdownComponent();

const panel = ref('start');
const gameKey = ref(0);
const gameMode = ref('normal');
const docsText = ref('');

const onStart = (mode) => {
  gameMode.value = mode === 'nightmare' ? 'nightmare' : 'normal';
  gameKey.value += 1;
  panel.value = 'game';
  docsText.value = '';
};

const onCode = () => {
  panel.value = 'code';
  docsText.value = '';
};

const onGallery = () => {
  panel.value = 'gallery';
  docsText.value = '';
};

const onDocs = async (filePath) => {
  panel.value = 'docs';
  docsText.value = '加载中...';
  try {
    const response = await fetch(filePath);
    docsText.value = await response.text();
  } catch (error) {
    console.error('加载文档失败:', error);
    docsText.value = '加载失败，请检查文件路径';
  }
};

const onBack = () => {
  panel.value = 'start';
  docsText.value = '';
};

const preGameSkills = PLAYER_SKILLS.filter((skill) => {
  return skill.type === 'active' && !skill.encounterOnly;
}).map((skill, index) => {
  return { id: skill.id, name: skill.name, icon: skill.icon, color: skill.color, slot: index < 9 ? index + 1 : '', stack: 1 };
});

const preKeybinds = ref(readKeybinds());
const awaitingKeybind = ref('');

const displayOfPre = (skillId, fallbackSlot) => {
  const code = preKeybinds.value[skillId];
  return code ? keybindCodeLabel(code) : fallbackSlot;
};

// 局内 setKeybind 走 bindKey
const bindKey = bindKeyBase;

// 开局改键
const handlePreGameKeyDown = (event) => {
  if (!awaitingKeybind.value || panel.value !== 'keybinds') {
    return;
  }
  event.preventDefault();
  if (event.code !== 'Escape') {
    preKeybinds.value = bindKey(preKeybinds.value, awaitingKeybind.value, event.code);
  }
  awaitingKeybind.value = '';
};

window.addEventListener('keydown', handlePreGameKeyDown);
</script>

<style scoped lang="scss">
.bro-melee {
  height: 100vh;
  overflow: hidden;
  background: #0a0c08;
}

.docs-panel {
  height: 100vh;
  overflow-y: auto;
  background: #fff;

  .docs-back {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
    cursor: pointer;
  }
}
</style>
