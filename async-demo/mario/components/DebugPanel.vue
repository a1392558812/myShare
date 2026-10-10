<template>
  <div class="debug-panel">
    <div class="dp-header">
      <span class="dp-title">🛠 调试面板</span>
      <span class="dp-tip">~ 开关</span>
      <button class="dp-close" @click="emit('close')">✕</button>
    </div>

    <div class="dp-body">
      <fieldset class="dp-section">
        <legend @click="s.level = !s.level">▾ 关卡 / 跳关</legend>
        <div v-if="s.level" class="dp-body-in">
          <div class="dp-row dp-now">
            <span>{{ hud.mode === 'endless' ? '无尽' : '故事' }} · {{ hud.levelName }}</span>
            <span class="dp-hint">#{{ hud.levelIndex }} · 路程 {{ hud.progress }}%</span>
          </div>
          <div class="dp-row">
            <button class="dp-btn" @click="gotoLevel(hud.levelIndex - 1)">◀ 上一关</button>
            <button class="dp-btn" @click="gotoLevel(hud.levelIndex + 1)">下一关 ▶</button>
          </div>
          <div class="dp-row">
            <select :value="selLevel" class="dp-select" @change="gotoLevel($event.target.value)">
              <option v-for="l in levelOptions" :key="l.i" :value="l.i">{{ l.name }}</option>
            </select>
          </div>
          <div class="dp-row">
            <label>跳到</label>
            <input v-model.number="panel.targetLevel" class="dp-num" type="number" min="0" />
            <button class="dp-btn" @click="gotoLevel(panel.targetLevel)">跳转</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-green" @click="warpFlag">🏁 直达旗杆</button>
            <button class="dp-btn dp-green" @click="clearNow">✅ 立即通关</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn" @click="tp(-panel.stepCols)">◀◀</button>
            <button class="dp-btn" @click="tp(-1)">◀</button>
            <input v-model.number="panel.stepCols" class="dp-num" type="number" min="1" />
            <button class="dp-btn" @click="tp(1)">▶</button>
            <button class="dp-btn" @click="tp(panel.stepCols)">▶▶</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn" @click="gotoLevel(hud.levelIndex)">↺ 重开本关</button>
            <button class="dp-btn" @click="enterBonus">🪙 进金币房</button>
          </div>
        </div>
      </fieldset>

      <fieldset class="dp-section">
        <legend @click="s.player = !s.player">▾ 角色 / 资源</legend>
        <div v-if="s.player" class="dp-body-in">
          <div class="dp-row">
            <label>形态</label>
            <button v-for="f in forms" :key="f.k" class="dp-btn" :class="{ on: hud.form === f.k }"
              @click="setForm(f.k)">{{ f.n }}</button>
          </div>
          <div class="dp-row">
            <label>生命</label>
            <button class="dp-btn dp-sm" @click="addLives(-1)">-1</button>
            <button class="dp-btn dp-sm" @click="addLives(1)">+1</button>
            <button class="dp-btn dp-sm" @click="addLives(99)">补满</button>
            <span class="dp-hint">×{{ hud.lives }}</span>
          </div>
          <div class="dp-row">
            <label>金币</label>
            <button class="dp-btn dp-sm" @click="addCoins(1)">+1</button>
            <button class="dp-btn dp-sm" @click="addCoins(10)">+10</button>
            <button class="dp-btn dp-sm" @click="addCoins(50)">+50</button>
            <button class="dp-btn dp-sm" @click="addCoins(100)">+100</button>
            <span class="dp-hint">×{{ hud.coins }}</span>
          </div>
          <div class="dp-row">
            <label>分数</label>
            <button class="dp-btn dp-sm" @click="addScore(1000)">+1000</button>
            <button class="dp-btn dp-sm" @click="addScore(10000)">+10000</button>
            <button class="dp-btn dp-sm" @click="addScore(-hud.score)">清零</button>
            <span class="dp-hint">{{ hud.score }}</span>
          </div>
          <div class="dp-row">
            <label>时间</label>
            <button class="dp-btn dp-sm" @click="setTime(hud.time + 30)">+30s</button>
            <button class="dp-btn dp-sm" @click="setTime(hud.time + 100)">+100s</button>
            <button class="dp-btn dp-sm" @click="setTime(TIME.level)">补满</button>
            <span class="dp-hint">{{ hud.time }}s</span>
          </div>
          <div class="dp-row">
            <label>道具</label>
            <button class="dp-btn dp-sm" @click="spawn('mushroom')">🍄</button>
            <button class="dp-btn dp-sm" @click="spawn('flower')">🌸</button>
            <button class="dp-btn dp-sm" @click="spawn('star')">⭐</button>
            <button class="dp-btn dp-sm" @click="spawn('1up')">1UP</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn" :class="{ on: hud.star > 0 }" @click="toggleStar">
              {{ hud.star > 0 ? `无敌星 ${(hud.star / 60).toFixed(1)}s` : '给无敌星' }}
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset class="dp-section">
        <legend @click="s.flags = !s.flags">▾ 开关</legend>
        <div v-if="s.flags" class="dp-body-in">
          <div class="dp-row">
            <label><input v-model="flags.godMode" type="checkbox" /> 无敌（不掉血 / 碰怪秒杀）</label>
          </div>
          <div class="dp-row">
            <label><input v-model="flags.flyMode" type="checkbox" /> 穿墙飞行（↑↓←→ / Shift 加速）</label>
          </div>
          <div class="dp-row">
            <label><input v-model="flags.freezeEnemies" type="checkbox" /> 冻结敌人</label>
            <label><input v-model="flags.freezeTime" type="checkbox" /> 冻结时间</label>
          </div>
          <div class="dp-row">
            <label><input v-model="flags.showBoxes" type="checkbox" /> 碰撞盒</label>
            <label><input v-model="flags.showGrid" type="checkbox" /> 瓦片网格</label>
            <label><input v-model="flags.showInfo" type="checkbox" /> 状态信息</label>
          </div>
          <div class="dp-row">
            <label>倍速</label>
            <button v-for="sp in speeds" :key="sp" class="dp-btn dp-sm" :class="{ on: flags.speed === sp }"
              @click="flags.speed = sp">{{ sp }}x</button>
          </div>
          <div class="dp-row">
            <label><input v-model="panel.pauseOnOpen" type="checkbox" /> 打开面板时暂停</label>
          </div>
        </div>
      </fieldset>

      <fieldset class="dp-section">
        <legend @click="s.enemy = !s.enemy">▾ 敌人</legend>
        <div v-if="s.enemy" class="dp-body-in">
          <div class="dp-row">
            <button class="dp-btn dp-red" @click="killAll">💀 秒杀全场敌人</button>
          </div>
          <div class="dp-row">
            <span class="dp-hint">当前敌人：{{ enemyCount }} · 火球：{{ fireballCount }}</span>
          </div>
        </div>
      </fieldset>

      <fieldset class="dp-section">
        <legend @click="s.info = !s.info">▾ 运行时</legend>
        <div v-if="s.info" class="dp-body-in">
          <div class="dp-row dp-now"><span>{{ rt.pos }}</span></div>
          <div class="dp-row dp-now"><span>{{ rt.vel }}</span></div>
          <div class="dp-row dp-now"><span>{{ rt.state }}</span></div>
          <div class="dp-row dp-now"><span>{{ rt.world }}</span></div>
        </div>
      </fieldset>

      <div class="dp-foot">
        <button class="dp-btn" @click="emit('toggle-pause')">{{ hud.paused ? '▶ 继续' : '⏸ 暂停' }}</button>
        <button class="dp-btn dp-red" @click="resetDebug">重置调试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useDebug } from '../composables/useDebug.js'
import { TIME } from '../constants.js'
import {
  LEVELS, debugGotoLevel, debugClearLevel, debugWarpToFlag, debugTeleportBy,
  debugAddCoins, debugAddScore, debugAddLives, debugSetForm, debugSetStar,
  debugSetTime, debugKillEnemies, debugSpawnItem, debugEnterBonus,
} from '../game.js'

const props = defineProps({
  game: { type: Object, required: true },
  hud: { type: Object, required: true },
})

const emit = defineEmits(['close', 'toggle-pause'])

const { flags, panel, resetDebug } = useDebug()
const s = reactive({ level: true, player: true, flags: true, enemy: true, info: true })
const speeds = [0.5, 1, 2, 3]
const forms = [{ k: 'small', n: '小' }, { k: 'big', n: '超级' }, { k: 'fire', n: '火力' }]

const levelOptions = computed(() => LEVELS.map((l, i) => ({ i, name: `${i + 1}. ${l.name}` })))
const selLevel = computed(() => Math.min(props.hud.levelIndex, LEVELS.length - 1))

const rt = computed(() => {
  const g = props.game
  const p = g.player
  return {
    pos: `pos ${p.x.toFixed(0)},${p.y.toFixed(0)}  tile ${Math.floor(p.x / 32)},${Math.floor(p.y / 32)}`,
    vel: `vx ${p.vx.toFixed(2)}  vy ${p.vy.toFixed(2)}  ground ${p.onGround ? 'Y' : 'N'}`,
    state: `status ${props.hud.status}  room ${g.room ? 'BONUS' : '-'}  cp ${g.checkpoint ? 'Y' : 'N'}`,
    world: `level ${g.level.w}×${g.level.h}  cam ${g.cam.x.toFixed(0)}`,
  }
})
const enemyCount = computed(() => props.game.enemies.filter((e) => !e.dead).length)
const fireballCount = computed(() => props.game.fireballs.length)

const gotoLevel = (i) => { debugGotoLevel(props.game, Number(i) || 0) }
const warpFlag = () => debugWarpToFlag(props.game)
const clearNow = () => debugClearLevel(props.game)
const tp = (d) => debugTeleportBy(props.game, Number(d) || 0)
const addCoins = (n) => debugAddCoins(props.game, n)
const addScore = (n) => debugAddScore(props.game, n)
const addLives = (n) => debugAddLives(props.game, n)
const setForm = (f) => debugSetForm(props.game, f)
const spawn = (k) => debugSpawnItem(props.game, k)
const setTime = (sec) => debugSetTime(props.game, sec)
const killAll = () => debugKillEnemies(props.game)
const enterBonus = () => debugEnterBonus(props.game, 0)
const toggleStar = () => debugSetStar(props.game, props.hud.star <= 0)
</script>

<style scoped lang="scss">
.debug-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  width: 330px;
  height: 100vh;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  color: #f4ecff;
  background: rgba(18, 8, 28, 0.97);
  border-left: 1px solid rgba(252, 216, 0, 0.3);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.55);
}

.dp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(45, 20, 62, 0.9);
  border-bottom: 1px solid rgba(252, 216, 0, 0.25);
}

.dp-title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #fcd800;
}

.dp-tip {
  font-size: 10px;
  color: rgba(244, 236, 255, 0.45);
}

.dp-close {
  width: 24px;
  height: 24px;
  font-size: 13px;
  color: #b9a8d0;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(185, 168, 208, 0.35);
  border-radius: 4px;

  &:hover {
    color: #ff5a4a;
    border-color: #ff5a4a;
  }
}

.dp-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.dp-section {
  padding: 6px 8px 8px;
  margin-bottom: 8px;
  background: rgba(45, 20, 62, 0.45);
  border: 1px solid rgba(252, 216, 0, 0.18);
  border-radius: 6px;

  legend {
    padding: 0 4px;
    font-size: 12px;
    font-weight: 600;
    color: #fcd800;
    cursor: pointer;
    user-select: none;
  }
}

.dp-body-in {
  margin-top: 6px;
}

.dp-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  margin-bottom: 5px;

  label {
    display: flex;
    gap: 4px;
    align-items: center;
    color: rgba(244, 236, 255, 0.7);
    white-space: nowrap;
    cursor: pointer;

    input[type="checkbox"] {
      accent-color: #fcd800;
    }
  }
}

.dp-now {
  color: rgba(244, 236, 255, 0.72);
}

.dp-num {
  width: 52px;
  padding: 2px 4px;
  font-family: inherit;
  font-size: 11px;
  color: #f4ecff;
  background: rgba(10, 4, 18, 0.85);
  border: 1px solid rgba(185, 168, 208, 0.35);
  border-radius: 3px;
}

.dp-select {
  flex: 1;
  padding: 3px 4px;
  font-family: inherit;
  font-size: 11px;
  color: #f4ecff;
  cursor: pointer;
  background: rgba(10, 4, 18, 0.85);
  border: 1px solid rgba(185, 168, 208, 0.35);
  border-radius: 3px;

  option {
    color: #f4ecff;
    background: #1d0f2c;
  }
}

.dp-hint {
  font-size: 10px;
  color: rgba(244, 236, 255, 0.45);
}

.dp-btn {
  padding: 3px 8px;
  font-family: inherit;
  font-size: 11px;
  color: #f4ecff;
  white-space: nowrap;
  cursor: pointer;
  background: rgba(60, 32, 84, 0.8);
  border: 1px solid rgba(185, 168, 208, 0.35);
  border-radius: 4px;

  &:hover {
    border-color: #fcd800;
    background: rgba(90, 48, 124, 0.9);
  }

  &.on {
    color: #2a1a00;
    background: #fcd800;
    border-color: #fcd800;
  }

  &.dp-sm {
    padding: 2px 6px;
    font-size: 10px;
  }

  &.dp-red {
    color: #ff7a6a;
    border-color: rgba(255, 90, 74, 0.4);
  }

  &.dp-green {
    color: #7cff9c;
    border-color: rgba(124, 255, 156, 0.4);
  }
}

.dp-foot {
  display: flex;
  gap: 8px;
  padding-bottom: 10px;
}
</style>
