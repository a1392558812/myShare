<template>
  <div class="game-main">
    <div v-if="phase === 'shop'" class="shop-layout">
      <ShopPanel
        :round="round"
        :totalRounds="totalRounds"
        :gold="gold"
        :bros="bros"
        :relics="relics"
        :shopChoices="shopChoices"
        :activeSynergies="activeSynergies"
        :currentRoundData="currentRoundData"
        :currentMaxBros="currentMaxBros"
        :isEndless="isEndless"
        :endlessWave="endlessWave"
        @buy="onBuy"
        @reroll="onReroll"
        @sell="onSell"
        @fight="onFight"
        @upgrade="onUpgrade"
      />
    </div>

    <div v-if="phase === 'battle'" class="battle-layout">
      <BattleCanvas
        :key="battleKey"
        :bros="bros"
        :enemyConfig="currentEnemyConfig"
        :statMult="currentStatMult"
        :relics="relics"
        :synergies="activeSynergies"
        @end="onBattleEnd"
      />
    </div>

    <BattleResultPanel
      v-if="phase === 'battleResult'"
      :round="round"
      :relicCandidates="relicCandidates"
      :isEndless="isEndless"
      :endlessWave="endlessWave"
      :gold="gold"
      :reforgeCost="reforgeCost"
      :ownedRelics="relics"
      @pick="onPickRelic"
      @skip="onSkipRelic"
      @reforge="onReforge"
    />

    <GameOverPanel
      v-if="phase === 'gameOver' || phase === 'victory'"
      :victory="phase === 'victory'"
      :round="round"
      :aliveCount="aliveBros.length"
      :relicsCount="relics.reduce((s, r) => s + r.count, 0)"
      :isEndless="isEndless"
      :endlessWave="endlessWave"
      @restart="onRestart"
      @endless="onStartEndless"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PHASE } from '../constants.js';
import { useGame } from '../composables/useGame.js';
import ShopPanel from './ShopPanel.vue';
import BattleCanvas from './BattleCanvas.vue';
import BattleResultPanel from './BattleResultPanel.vue';
import GameOverPanel from './GameOverPanel.vue';

const emit = defineEmits(['restart']);

const {
  phase, round, gold, bros, relics, shopChoices,
  relicCandidates, reforgeCost, totalRounds, aliveBros, activeSynergies,
  currentRoundData, currentMaxBros,
  currentEnemyConfig, currentStatMult,
  isEndless, endlessWave,
  startNewGame, buyBro, upgradeBro, rerollShop,
  sellBro, pickRelic, skipRelic, reforgeRelics, startBattle, startEndless,
  endBattle,
} = useGame();

const battleKey = ref(0);

startNewGame();

const onBuy = (broDef) => buyBro(broDef);
const onUpgrade = (instanceId, upgradeId) => upgradeBro(instanceId, upgradeId);
const onReroll = () => rerollShop();
const onSell = (instanceId) => sellBro(instanceId);
const onFight = () => {
  battleKey.value++;
  startBattle();
};
const onBattleEnd = (victory) => endBattle(victory);
const onPickRelic = (relicId) => pickRelic(relicId);
const onSkipRelic = () => skipRelic();
const onReforge = () => reforgeRelics();
const onRestart = () => emit('restart');
const onStartEndless = () => startEndless();
</script>

<style scoped>
.game-main {
  height: 100%;
  display: flex;
  position: relative;
}

.shop-layout {
  flex: 1;
  overflow: hidden;
}

.battle-layout {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  background: #0a0a0f;
  overflow: hidden;
}
</style>
