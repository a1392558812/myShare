<template>
  <div class="debug-panel">
    <div class="dp-header">
      <span class="dp-title">🛠 调试面板</span>
      <button class="dp-close" @click="$emit('close')">✕</button>
    </div>

    <div class="dp-body">
      <!-- 玩家状态 -->
      <fieldset class="dp-section">
        <legend @click="sections.player = !sections.player">
          ▾ 玩家状态
          <span v-if="!sections.player" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.player" class="dp-section-body">
          <div class="dp-row">
            <label>HP</label>
            <input type="range" :min="0" :max="Math.max(player.maxHp,1)" v-model.number="local.hp" @input="emitHp" />
            <input type="number" v-model.number="local.hp" @change="emitHp" class="dp-input-num" />
            <span class="dp-hint">/ {{ player.maxHp }}</span>
          </div>
          <div class="dp-row">
            <label>最大HP</label>
            <input type="number" v-model.number="local.maxHp" @change="emitMaxHp" class="dp-input-num" :min="1" />
            <button class="dp-btn" @click="resetMaxHp">重置</button>
          </div>
          <div class="dp-row">
            <label>速度</label>
            <input type="number" v-model.number="local.speed" @change="emitSpeed" class="dp-input-num" step="0.1" />
            <button class="dp-btn" @click="resetSpeed">重置</button>
          </div>
          <div class="dp-row">
            <label>基础攻击</label>
            <input type="number" v-model.number="local.baseAttack" @change="emitBaseAttack" class="dp-input-num" step="1" />
            <button class="dp-btn" @click="resetBaseAttack">重置</button>
          </div>
          <div class="dp-row">
            <label>闪避率</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="local.dodge" @input="emitDodge" />
            <input type="number" v-model.number="local.dodge" @change="emitDodge" class="dp-input-num" step="0.01" min="0" max="1" />
            <span class="dp-hint">{{ (local.dodge * 100).toFixed(0) }}%</span>
            <button class="dp-btn" @click="resetDodge">重置</button>
          </div>
          <div class="dp-row">
            <label>金币</label>
            <input type="number" v-model.number="local.gold" @change="emitGold" class="dp-input-num" :min="0" />
            <button class="dp-btn" @click="addGold(100)">+100</button>
            <button class="dp-btn" @click="addGold(1000)">+1000</button>
          </div>
          <div class="dp-row">
            <label>等级</label>
            <input type="number" v-model.number="local.level" @change="emitLevel" class="dp-input-num" :min="1" />
          </div>
          <div class="dp-row">
            <label>EXP</label>
            <input type="number" v-model.number="local.exp" @change="emitExp" class="dp-input-num" :min="0" />
            <button class="dp-btn" @click="addExp(1000)">+1000</button>
            <button class="dp-btn" @click="addExp(5000)">+5000</button>
          </div>
          <div class="dp-row">
            <label>坐标</label>
            <input type="number" v-model.number="local.px" @change="emitPos" class="dp-input-num" placeholder="X" />
            <input type="number" v-model.number="local.py" @change="emitPos" class="dp-input-num" placeholder="Y" />
            <button class="dp-btn" @click="resetPos">回原点</button>
          </div>
          <div class="dp-row">
            <label><input type="checkbox" v-model="flags.godMode" /> 无敌模式</label>
            <label><input type="checkbox" v-model="flags.showEnemyPaths" /> 显示敌人路径</label>
          </div>
        </div>
      </fieldset>

      <!-- 敌人控制 -->
      <fieldset class="dp-section">
        <legend @click="sections.enemy = !sections.enemy">
          ▾ 敌人控制
          <span v-if="!sections.enemy" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.enemy" class="dp-section-body">
          <div class="dp-row">
            <label><input type="checkbox" v-model="flags.pauseEnemyMovement" /> 暂停敌人移动</label>
          </div>
          <div class="dp-row">
            <label><input type="checkbox" v-model="flags.pauseEnemyAttack" /> 暂停敌人攻击</label>
          </div>
          <div class="dp-row">
            <label><input type="checkbox" v-model="enemyDbg.pauseSpawn" /> 暂停敌人刷新</label>
          </div>
          <div class="dp-row">
            <span>当前敌人数量：{{ enemies.length }}</span>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-btn-red" @click="$emit('kill-all-enemies')">💀 秒杀所有敌人</button>
            <button class="dp-btn" @click="$emit('freeze-enemies', 3000)">❄️ 冻结所有敌人 3s</button>
          </div>
        </div>
      </fieldset>

      <!-- 事件调试 -->
      <fieldset class="dp-section">
        <legend @click="sections.event = !sections.event">
          ▾ 事件调试
          <span v-if="!sections.event" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.event" class="dp-section-body">
          <div class="dp-row">
            <select v-model="eventDbg.eventType" class="dp-select">
              <option v-for="evt in eventOptions" :key="evt.id" :value="evt.id">{{ evt.icon }} {{ evt.name }}</option>
            </select>
            <button class="dp-btn dp-btn-green" @click="$emit('spawn-debug-event', eventDbg.eventType)">🎲 生成事件</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-btn-red" @click="$emit('clear-all-events')">🗑 清除所有事件</button>
            <span class="dp-hint">当前事件数：{{ eventsCount }}</span>
          </div>
        </div>
      </fieldset>

      <!-- 刷怪调试 -->
      <fieldset class="dp-section">
        <legend @click="sections.spawn = !sections.spawn">
          ▾ 刷怪调试
          <span v-if="!sections.spawn" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.spawn" class="dp-section-body">
          <div class="dp-row">
            <select v-model="spawnDbg.enemyType" class="dp-select">
              <optgroup label="普通敌人">
                <option v-for="t in normalEnemyOptions" :key="t.type" :value="t.type">{{ t.name }}</option>
              </optgroup>
              <optgroup label="精英敌人">
                <option v-for="t in eliteEnemyOptions" :key="t.type" :value="t.type">{{ t.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="dp-row">
            <label>数量</label>
            <button class="dp-btn dp-btn-sm" @click="spawnDbg.spawnCount = Math.max(1, spawnDbg.spawnCount - 1)">-</button>
            <input type="number" v-model.number="spawnDbg.spawnCount" class="dp-input-num" :min="1" style="width:48px" />
            <button class="dp-btn dp-btn-sm" @click="spawnDbg.spawnCount = Math.min(50, spawnDbg.spawnCount + 1)">+</button>
          </div>
          <div class="dp-row">
            <label><input type="checkbox" v-model="spawnDbg.nearPlayer" /> 玩家附近生成</label>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-btn-green" @click="$emit('spawn-debug-enemies', spawnDbg.enemyType, spawnDbg.spawnCount, spawnDbg.nearPlayer)">
              👾 生成敌人
            </button>
          </div>
        </div>
      </fieldset>

      <!-- Boss 调试 -->
      <fieldset class="dp-section">
        <legend @click="sections.boss = !sections.boss">
          ▾ Boss 调试
          <span v-if="!sections.boss" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.boss" class="dp-section-body">
          <!-- 当前 Boss 状态（只读） -->
          <div class="dp-row" v-if="activeBoss">
            <span class="dp-boss-info">
              {{ activeBoss.bossName }} | Lv.{{ player.level }} x {{ bossHpScale }}
              <br>{{ bossStateText }} | HP: {{ activeBoss.hp.toFixed(0) }}/{{ activeBoss.maxHp }}
              <span v-if="activeBossPhase"> | {{ activeBossPhase.name }}</span>
            </span>
          </div>
          <div class="dp-row" v-if="bossCooldownRemaining > 0">
            <span class="dp-hint">Boss 冷却剩余：{{ (bossCooldownRemaining / 1000).toFixed(1) }}s</span>
          </div>
          <div class="dp-row" v-if="!activeBoss">
            <span class="dp-hint">无活跃 Boss</span>
          </div>
          <!-- Boss 控制 -->
          <div class="dp-row">
            <select v-model="bossDbg.bossId" class="dp-select">
              <option value="">随机选择</option>
              <option v-for="b in bossOptions" :key="b.id" :value="b.id">{{ b.name }} (Lv.{{ b.unlockPlayerLevel }})</option>
            </select>
            <button class="dp-btn dp-btn-green" @click="$emit('force-spawn-boss')">🎯 强制刷 Boss</button>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-btn-red" @click="$emit('force-kill-boss')" :disabled="!activeBoss">☠️ 强制击杀 Boss</button>
            <label><input type="checkbox" v-model="bossDbg.skipCooldown" /> 跳过冷却</label>
          </div>
        </div>
      </fieldset>

      <!-- Buff 面板 -->
      <fieldset class="dp-section" v-if="buffs && buffs.length > 0">
        <legend @click="sections.buff = !sections.buff">
          ▾ 当前 Buff（{{ buffs.length }}）
          <span v-if="!sections.buff" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.buff" class="dp-section-body">
          <div v-for="(bf, i) in buffs" :key="i" class="dp-row">
            <span class="dp-buff-name">{{ bf.label }}</span>
            <span class="dp-buff-time">{{ (bf.remaining / 1000).toFixed(1) }}s</span>
            <button class="dp-btn dp-btn-sm" @click="$emit('clear-buff', i)">✕</button>
          </div>
        </div>
      </fieldset>

      <!-- 技能管理 -->
      <fieldset class="dp-section">
        <legend @click="sections.skill = !sections.skill">
          ▾ 技能管理
          <span v-if="!sections.skill" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.skill" class="dp-section-body">
          <div v-for="sk in allSkills" :key="sk.id" class="dp-skill-row" :class="{ 'dp-skill-locked': !hasSkill(sk.id) }">
            <span class="dp-skill-icon">{{ sk.icon }}</span>
            <span class="dp-skill-name">{{ sk.name }}</span>
            <span class="dp-skill-lv">Lv.{{ sk.currentLevel || 0 }}</span>
            <template v-if="hasSkill(sk.id)">
              <button class="dp-btn dp-btn-sm" @click="$emit('change-skill-level', sk.id, -1)">-</button>
              <button class="dp-btn dp-btn-sm" @click="$emit('change-skill-level', sk.id, 1)">+</button>
              <button class="dp-btn dp-btn-sm" @click="$emit('reset-skill-cd', sk.id)">⏱CD</button>
              <button class="dp-btn dp-btn-sm dp-btn-red" @click="$emit('remove-skill', sk.id)">❌</button>
            </template>
            <template v-else>
              <button class="dp-btn dp-btn-sm dp-btn-green" @click="$emit('unlock-skill', sk.id)">✅ 解锁</button>
            </template>
          </div>
          <div class="dp-row" style="margin-top:8px">
            <button class="dp-btn" @click="unlockAll">解锁全部技能</button>
            <button class="dp-btn" @click="resetAllCd">全部重置CD</button>
          </div>
        </div>
      </fieldset>

      <!-- 全局 -->
      <fieldset class="dp-section">
        <legend @click="sections.global = !sections.global">
          ▾ 全局
          <span v-if="!sections.global" class="dp-collapse-hint">（点击展开）</span>
        </legend>
        <div v-if="sections.global" class="dp-section-body">
          <div class="dp-row">
            <label>游戏倍速</label>
            <input type="range" min="0.5" max="5" step="0.5" v-model.number="local.gameSpeed" @input="emitGameSpeed" />
            <span class="dp-hint">{{ local.gameSpeed }}x</span>
            <button class="dp-btn" @click="local.gameSpeed = 1; emitGameSpeed()">1x</button>
          </div>
          <div class="dp-row">
            <span>游戏时间：{{ formatTime(gameState.gameTime) }}</span>
          </div>
          <div class="dp-row">
            <span>击杀数：{{ gameState.killCount }}</span>
          </div>
          <div class="dp-row">
            <button class="dp-btn dp-btn-red" @click="resetAllFlags">重置所有调试状态</button>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useDebug } from '../composables/useDebug.js'
import { SKILL_TABLE, PLAYER_ATTRS, BOSS_TABLE, EVENT_TYPES, ENEMY_TYPE_TABLE } from '../constants.js'

const props = defineProps({
  player: { type: Object, required: true },
  enemies: { type: Array, required: true },
  gameState: { type: Object, required: true },
  skills: { type: Array, required: true },
  /** 活跃事件列表（只读展示数量） */
  events: { type: Array, default: () => [] },
  /** 活跃 Boss 实体（只读展示） */
  activeBoss: { type: Object, default: null },
  /** Boss 状态机字符串 */
  bossState: { type: String, default: 'idle' },
  /** Boss 冷却剩余 ms */
  bossCooldownRemaining: { type: Number, default: 0 },
  /** 当前 Boss 阶段信息 */
  bossPhase: { type: Object, default: null },
  /** 活跃 buff 列表 */
  buffs: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'close', 'kill-all-enemies', 'freeze-enemies',
  'set-player-hp', 'set-player-speed', 'set-player-base-attack',
  'set-player-dodge', 'set-player-gold', 'set-player-maxHp',
  'set-player-level', 'set-player-exp', 'set-player-pos',
  'change-skill-level', 'reset-skill-cd', 'unlock-skill', 'remove-skill', 'add-exp',
  'force-spawn-boss', 'force-kill-boss', 'clear-buff',
  'spawn-debug-event', 'clear-all-events',
  'spawn-debug-enemies',
])

const { debugFlags, playerOverride, enemyDebug, bossDebug, eventDebug, enemySpawnDebug, gameSpeed } = useDebug()
const flags = debugFlags
const enemyDbg = enemyDebug
const bossDbg = bossDebug
const eventDbg = eventDebug
const spawnDbg = enemySpawnDebug

const sections = reactive({ player: true, enemy: true, event: true, spawn: true, boss: true, buff: true, skill: true, global: false })

// ─── Boss 选项下拉 ───
const bossOptions = computed(() => BOSS_TABLE)

// ─── Boss 状态文本映射 ───
const bossStateMap = {
  idle: '空闲', warning: '⚠ 预警中', spawning: '正在生成', active: '战斗中', dying: '濒死', defeated: '已击败',
}
const bossStateText = computed(() => bossStateMap[props.bossState] || props.bossState)
const activeBossPhase = computed(() => props.bossPhase)

// ─── Boss HP 倍率（Lv vs 基础 HP 之比） ───
const bossHpScale = computed(() => {
  if (!props.activeBoss) return ''
  const cfg = BOSS_TABLE.find(b => b.id === props.activeBoss.bossId)
  if (!cfg || cfg.hp === 0) return ''
  const scale = ((props.activeBoss.maxHp / cfg.hp) * 100).toFixed(0)
  return `${scale}%HP`
})

// ─── 事件选项下拉 ───
const eventOptions = computed(() => {
  return Object.values(EVENT_TYPES).map(cfg => ({
    id: cfg.id,
    name: cfg.name,
    icon: cfg.icon,
  }))
})
const eventsCount = computed(() => props.events?.length || 0)

// ─── 刷怪选项下拉（分组） ───
const normalEnemyOptions = computed(() => {
  return ENEMY_TYPE_TABLE
    .filter(t => !t.attrs.eliteTier)
    .map(t => ({
      type: t.type,
      name: `${t.attrs.icon || '👾'} ${t.attrs.name || t.type}`,
    }))
})
const eliteEnemyOptions = computed(() => {
  return ENEMY_TYPE_TABLE
    .filter(t => !!t.attrs.eliteTier)
    .map(t => ({
      type: t.type,
      name: `${t.attrs.icon || '👾'} ${t.attrs.name || t.type}`,
    }))
})

// ─── 本地编辑缓冲 ───
const local = reactive({
  hp: 0,
  maxHp: PLAYER_ATTRS.maxHp,
  speed: PLAYER_ATTRS.speed,
  baseAttack: PLAYER_ATTRS.baseAttack,
  dodge: 0,
  gold: 0,
  level: 1,
  exp: 0,
  px: 0,
  py: 0,
  gameSpeed: 1.0,
})

// ─── 观察 player  → local 同步 ───
watch(() => props.player.hp, v => { local.hp = Math.round(v) }, { immediate: true })
watch(() => props.player.maxHp, v => { if (playerOverride.maxHp === null) local.maxHp = v }, { immediate: true })
watch(() => props.player.speed, v => { if (playerOverride.speed === null) local.speed = v }, { immediate: true })
watch(() => props.player.baseAttack, v => { if (playerOverride.baseAttack === null) local.baseAttack = v }, { immediate: true })
watch(() => (props.player.dodgeChance || 0), v => { if (playerOverride.dodgeChance === null) local.dodge = v }, { immediate: true })
watch(() => (props.player.gold || 0), v => { if (playerOverride.gold === null) local.gold = v }, { immediate: true })
watch(() => props.player.level, v => { local.level = v }, { immediate: true })
watch(() => props.player.exp, v => { local.exp = v }, { immediate: true })
watch(() => props.player.x, v => { local.px = Math.round(v) }, { immediate: true })
watch(() => props.player.y, v => { local.py = Math.round(v) }, { immediate: true })
watch(gameSpeed, v => { local.gameSpeed = v }, { immediate: true })

// ─── 技能列表 ───
const allSkills = computed(() => {
  return SKILL_TABLE.map(tpl => {
    const owned = props.skills.find(s => s.id === tpl.id)
    return owned ? { ...tpl, currentLevel: owned.currentLevel } : { ...tpl, currentLevel: 0 }
  })
})

const hasSkill = (id) => props.skills.find(s => s.id === id)

// ─── 已有 emit 方法 ───
const emitHp = () => { emit('set-player-hp', local.hp) }
const emitSpeed = () => {
  playerOverride.speed = local.speed
  emit('set-player-speed', local.speed)
}
const resetSpeed = () => {
  playerOverride.speed = null
  props.player.speed = PLAYER_ATTRS.speed
  local.speed = PLAYER_ATTRS.speed
}
const emitBaseAttack = () => {
  playerOverride.baseAttack = local.baseAttack
  emit('set-player-base-attack', local.baseAttack)
}
const resetBaseAttack = () => {
  playerOverride.baseAttack = null
  props.player.baseAttack = PLAYER_ATTRS.baseAttack
  local.baseAttack = PLAYER_ATTRS.baseAttack
}
const emitLevel = () => { emit('set-player-level', local.level) }
const emitExp = () => { emit('set-player-exp', local.exp) }
const addExp = (amt) => { emit('add-exp', amt) }
const emitPos = () => { emit('set-player-pos', local.px, local.py) }
const resetPos = () => {
  local.px = 0; local.py = 0
  emit('set-player-pos', 0, 0)
}

// ─── 新增 emit 方法 ───
const emitDodge = () => {
  playerOverride.dodgeChance = local.dodge
  emit('set-player-dodge', local.dodge)
}
const resetDodge = () => {
  playerOverride.dodgeChance = null
  props.player.dodgeChance = 0
  local.dodge = 0
}
const emitGold = () => {
  playerOverride.gold = local.gold
  emit('set-player-gold', local.gold)
}
const addGold = (amt) => {
  local.gold += amt
  emitGold()
}
const emitMaxHp = () => {
  playerOverride.maxHp = local.maxHp
  emit('set-player-maxHp', local.maxHp)
}
const resetMaxHp = () => {
  playerOverride.maxHp = null
  props.player.maxHp = PLAYER_ATTRS.maxHp
  local.maxHp = PLAYER_ATTRS.maxHp
}
const emitGameSpeed = () => {
  gameSpeed.value = local.gameSpeed
}

const unlockAll = () => {
  SKILL_TABLE.forEach(tpl => {
    if (!props.skills.find(s => s.id === tpl.id)) {
      emit('unlock-skill', tpl.id)
    }
  })
}
const resetAllCd = () => { props.skills.forEach(s => { s.remainingCooldown = 0 }) }

const resetAllFlags = () => {
  flags.pauseEnemyMovement = false
  flags.pauseEnemyAttack = false
  flags.godMode = false
  flags.showEnemyPaths = false
  enemyDbg.pauseSpawn = false
  bossDbg.forceSpawn = false
  bossDbg.bossId = ''
  bossDbg.forceKill = false
  bossDbg.skipCooldown = false
  gameSpeed.value = 1.0
  local.gameSpeed = 1.0
  resetSpeed()
  resetBaseAttack()
  resetDodge()
  resetMaxHp()
}

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}分${s % 60}秒`
}
</script>

<style scoped lang="scss">
.debug-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 370px;
  height: 100vh;
  background: rgba(15, 23, 42, 0.97);
  border-left: 1px solid rgba(100, 116, 139, 0.4);
  color: #e2e8f0;
  font-size: 12px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: 'Consolas', 'Monaco', monospace;
}

.dp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(30, 41, 59, 0.9);
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
}

.dp-title { font-weight: 700; font-size: 14px; }

.dp-close {
  background: none;
  border: 1px solid rgba(100, 116, 139, 0.4);
  color: #94a3b8;
  border-radius: 4px;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  &:hover { color: #f87171; border-color: #f87171; }
}

.dp-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.dp-section {
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 6px;
  margin-bottom: 8px;
  padding: 6px 8px 8px;
  background: rgba(30, 41, 59, 0.4);
}

.dp-section legend {
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #fbbf24;
  user-select: none;
  padding: 0 4px;
  &:hover { color: #f59e0b; }
}

.dp-collapse-hint { font-size: 10px; color: #64748b; font-weight: 400; }

.dp-section-body { margin-top: 6px; }

.dp-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  flex-wrap: wrap;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    white-space: nowrap;
    input[type="checkbox"] { accent-color: #fbbf24; }
  }

  input[type="range"] {
    flex: 1;
    min-width: 60px;
    accent-color: #3b82f6;
  }
}

.dp-input-num {
  width: 64px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 3px;
  color: #e2e8f0;
  padding: 2px 4px;
  font-size: 11px;
  font-family: inherit;
}

.dp-select {
  flex: 1;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 3px;
  color: #e2e8f0;
  padding: 3px 4px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  option { background: #1e293b; color: #e2e8f0; }
}

.dp-hint { color: #64748b; font-size: 10px; }

.dp-btn {
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  color: #e2e8f0;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  white-space: nowrap;
  &:hover { background: rgba(71, 85, 105, 0.9); border-color: #fbbf24; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &-sm { padding: 2px 5px; font-size: 10px; }
  &-red { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
  &-green { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
}

.dp-skill-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding: 3px 4px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.5);
}

.dp-skill-icon { font-size: 14px; width: 20px; text-align: center; }
.dp-skill-name { flex: 1; font-size: 11px; }
.dp-skill-lv { color: #fbbf24; font-size: 10px; white-space: nowrap; }
.dp-skill-status { color: #64748b; font-size: 10px; }
.dp-skill-locked { opacity: 0.6; }

.dp-boss-info {
  font-size: 11px;
  line-height: 1.5;
  color: #fbbf24;
  background: rgba(30, 41, 59, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  width: 100%;
}

.dp-buff-name { flex: 1; font-size: 11px; }
.dp-buff-time { color: #fbbf24; font-size: 10px; white-space: nowrap; }
</style>
