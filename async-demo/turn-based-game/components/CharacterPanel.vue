<template>
  <div class="character-panel">
    <div class="panel-header">
      <h2>角色信息</h2>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>
    
    <div class="panel-content">
      <!-- 左侧：基本属性 -->
      <div class="section stats-section">
        <h3>📊 属性</h3>
        
        <div class="basic-info">
          <div class="info-row">
            <span class="label">角色名</span>
            <span class="value">{{ gameState.player.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">等级</span>
            <span class="value">Lv.{{ gameState.player.level }}</span>
          </div>
        </div>
        
        <div class="exp-bar">
          <div class="exp-label">经验值</div>
          <div class="exp-bar-bg">
            <div class="exp-bar-fill" :style="{ width: (gameState.player.exp / gameState.player.expToNext * 100) + '%' }"></div>
          </div>
          <div class="exp-text">{{ gameState.player.exp }} / {{ gameState.player.expToNext }}</div>
        </div>
        
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">❤️ 生命</span>
            <span class="stat-value">{{ gameState.player.hp }} / {{ gameState.player.maxHp }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💎 法力</span>
            <span class="stat-value">{{ gameState.player.mp }} / {{ gameState.player.maxMp }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">⚔️ 物理攻击</span>
            <span class="stat-value">{{ gameState.player.physicalAttack }}</span>
            <div v-if="gameState.player.freePoints > 0" class="stat-add">
              <button @click="addPoint('physicalAttack')">+</button>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">✨ 法术攻击</span>
            <span class="stat-value">{{ gameState.player.magicAttack }}</span>
            <div v-if="gameState.player.freePoints > 0" class="stat-add">
              <button @click="addPoint('magicAttack')">+</button>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">🛡️ 防御</span>
            <span class="stat-value">{{ gameState.player.defense }}</span>
            <div v-if="gameState.player.freePoints > 0" class="stat-add">
              <button @click="addPoint('defense')">+</button>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">💨 速度</span>
            <span class="stat-value">{{ gameState.player.speed }}</span>
            <div v-if="gameState.player.freePoints > 0" class="stat-add">
              <button @click="addPoint('speed')">+</button>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-label">💖 生命上限</span>
            <span class="stat-value">{{ gameState.player.maxHp }}</span>
            <div v-if="gameState.player.freePoints > 0" class="stat-add">
              <button @click="addPoint('maxHp')">+</button>
            </div>
          </div>
        </div>
        
        <div v-if="gameState.player.freePoints > 0" class="free-points">
          🌟 可用属性点: {{ gameState.player.freePoints }}
        </div>
        
        <div class="restore-buttons">
          <button class="game-btn" @click="restoreHp">休息恢复生命</button>
          <button class="game-btn" @click="restoreMp">休息恢复法力</button>
        </div>
      </div>
      
      <!-- 中间：技能 -->
      <div class="section skills-section">
        <h3>📚 技能</h3>
        <div class="skill-list">
          <div v-for="skill in gameState.player.skills" :key="skill.id" class="skill-card">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-type">{{ skill.type === 'magic' ? '法术' : '物理' }}</div>
            <div class="skill-cost">消耗: {{ skill.cost }} MP</div>
            <div class="skill-desc">{{ skill.description }}</div>
          </div>
        </div>
        <div v-if="gameState.player.skills.length === 0" class="empty-tip">
          暂无技能，战斗胜利有概率获得技能书！
        </div>
      </div>
      
      <!-- 右侧：背包 -->
      <div class="section inventory-section">
        <h3>🎒 背包</h3>
        <div class="inventory-grid">
          <div 
            v-for="(item, index) in gameState.player.inventory" 
            :key="item.id" 
            class="item-card"
            @mouseenter="showItemTooltip(item, $event)"
            @mouseleave="hideItemTooltip"
          >
            <div class="item-icon">
              {{ item.type === 'heal' ? '❤️' : item.type === 'mana' ? '💎' : '📦' }}
            </div>
            <div class="item-count-badge">x{{ item.count }}</div>
            <div v-if="activeItem === item" class="item-tooltip">
              <div class="tooltip-item-name">{{ item.name }}</div>
              <div class="tooltip-item-desc">{{ item.description }}</div>
              <div class="tooltip-item-value">价值: {{ item.value }} 金币</div>
              <button class="tooltip-use-btn" @click.stop="useItem(index)">使用</button>
              <button class="tooltip-sell-btn" @click.stop="sellItem(index)">出售</button>
            </div>
          </div>
        </div>
        <div v-if="gameState.player.inventory.length === 0" class="empty-tip">
          背包空空如也，去战斗获取战利品吧！
        </div>
      </div>
      
      <!-- 装备穿戴区 -->
      <div class="section equipment-section">
        <h3>🛡️ 装备</h3>
        <div class="equipment-slots">
          <div class="slot-row">
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.weapon }" @mouseenter="showTooltip('weapon', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">🗡️</span>
              <span class="slot-label">武器</span>
              <div v-if="gameState.player.equipment.weapon" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.weapon.rarity) }">
                {{ gameState.player.equipment.weapon.name }}
                <button class="unequip-btn" @click="unequipItem('weapon')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'weapon'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.weapon.rarity) }">
                  Lv.{{ gameState.player.equipment.weapon.level }} {{ gameState.player.equipment.weapon.name }}
                  <span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.weapon.rarity) }}]</span>
                </div>
                <div class="tooltip-stats">
                  <div class="base-stats">
                    <span class="stats-label">基础:</span>
                    <span v-for="(value, stat) in gameState.player.equipment.weapon.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span>
                  </div>
                  <div class="affix-stats">
                    <span class="stats-label">词条:</span>
                    <span v-for="(value, stat) in gameState.player.equipment.weapon.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span>
                    <span v-if="Object.keys(gameState.player.equipment.weapon.affixes || {}).length === 0" class="stat-badge empty-badge">无</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.necklace }" @mouseenter="showTooltip('necklace', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">📿</span>
              <span class="slot-label">项链</span>
              <div v-if="gameState.player.equipment.necklace" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.necklace.rarity) }">
                {{ gameState.player.equipment.necklace.name }}
                <button class="unequip-btn" @click="unequipItem('necklace')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'necklace'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.necklace.rarity) }">
                  Lv.{{ gameState.player.equipment.necklace.level }} {{ gameState.player.equipment.necklace.name }}
                  <span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.necklace.rarity) }}]</span>
                </div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.necklace.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.necklace.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.necklace.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.crown }" @mouseenter="showTooltip('crown', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">👑</span>
              <span class="slot-label">头冠</span>
              <div v-if="gameState.player.equipment.crown" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.crown.rarity) }">
                {{ gameState.player.equipment.crown.name }}
                <button class="unequip-btn" @click="unequipItem('crown')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'crown'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.crown.rarity) }">
                  Lv.{{ gameState.player.equipment.crown.level }} {{ gameState.player.equipment.crown.name }}
                  <span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.crown.rarity) }}]</span>
                </div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.crown.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.crown.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.crown.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="slot-row">
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.chest }" @mouseenter="showTooltip('chest', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">🦺</span>
              <span class="slot-label">护胸甲</span>
              <div v-if="gameState.player.equipment.chest" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.chest.rarity) }">
                {{ gameState.player.equipment.chest.name }}
                <button class="unequip-btn" @click="unequipItem('chest')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'chest'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.chest.rarity) }">Lv.{{ gameState.player.equipment.chest.level }} {{ gameState.player.equipment.chest.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.chest.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.chest.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.chest.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.chest.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.jade }" @mouseenter="showTooltip('jade', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">🪨</span>
              <span class="slot-label">玉佩</span>
              <div v-if="gameState.player.equipment.jade" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.jade.rarity) }">
                {{ gameState.player.equipment.jade.name }}
                <button class="unequip-btn" @click="unequipItem('jade')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'jade'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.jade.rarity) }">Lv.{{ gameState.player.equipment.jade.level }} {{ gameState.player.equipment.jade.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.jade.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.jade.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.jade.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.jade.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.belt }" @mouseenter="showTooltip('belt', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">💫</span>
              <span class="slot-label">腰带</span>
              <div v-if="gameState.player.equipment.belt" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.belt.rarity) }">
                {{ gameState.player.equipment.belt.name }}
                <button class="unequip-btn" @click="unequipItem('belt')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'belt'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.belt.rarity) }">Lv.{{ gameState.player.equipment.belt.level }} {{ gameState.player.equipment.belt.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.belt.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.belt.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.belt.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.belt.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="slot-row">
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.leftRing }" @mouseenter="showTooltip('leftRing', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">💍</span>
              <span class="slot-label">左手环</span>
              <div v-if="gameState.player.equipment.leftRing" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.leftRing.rarity) }">
                {{ gameState.player.equipment.leftRing.name }}
                <button class="unequip-btn" @click="unequipItem('leftRing')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'leftRing'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.leftRing.rarity) }">Lv.{{ gameState.player.equipment.leftRing.level }} {{ gameState.player.equipment.leftRing.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.leftRing.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.leftRing.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.leftRing.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.leftRing.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.legs }" @mouseenter="showTooltip('legs', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">👖</span>
              <span class="slot-label">护腿甲</span>
              <div v-if="gameState.player.equipment.legs" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.legs.rarity) }">
                {{ gameState.player.equipment.legs.name }}
                <button class="unequip-btn" @click="unequipItem('legs')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'legs'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.legs.rarity) }">Lv.{{ gameState.player.equipment.legs.level }} {{ gameState.player.equipment.legs.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.legs.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.legs.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.legs.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.legs.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.rightRing }" @mouseenter="showTooltip('rightRing', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">💍</span>
              <span class="slot-label">右手环</span>
              <div v-if="gameState.player.equipment.rightRing" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.rightRing.rarity) }">
                {{ gameState.player.equipment.rightRing.name }}
                <button class="unequip-btn" @click="unequipItem('rightRing')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'rightRing'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.rightRing.rarity) }">Lv.{{ gameState.player.equipment.rightRing.level }} {{ gameState.player.equipment.rightRing.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.rightRing.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.rightRing.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.rightRing.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.rightRing.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="slot-row">
            <div class="slot-item" :class="{ equipped: gameState.player.equipment.shoes }" @mouseenter="showTooltip('shoes', $event)" @mouseleave="hideTooltip">
              <span class="slot-icon">👟</span>
              <span class="slot-label">鞋子</span>
              <div v-if="gameState.player.equipment.shoes" class="slot-equip" :style="{ color: getRarityColor(gameState.player.equipment.shoes.rarity) }">
                {{ gameState.player.equipment.shoes.name }}
                <button class="unequip-btn" @click="unequipItem('shoes')">卸下</button>
              </div>
              <div v-if="tooltipSlot === 'shoes'" class="equipment-tooltip">
                <div class="tooltip-header" :style="{ color: getRarityColor(gameState.player.equipment.shoes.rarity) }">Lv.{{ gameState.player.equipment.shoes.level }} {{ gameState.player.equipment.shoes.name }}<span class="tooltip-rarity">[{{ getRarityName(gameState.player.equipment.shoes.rarity) }}]</span></div>
                <div class="tooltip-stats">
                  <div class="base-stats"><span class="stats-label">基础:</span><span v-for="(value, stat) in gameState.player.equipment.shoes.baseStats" :key="stat" class="stat-badge base-badge">{{ getStatName(stat) }} +{{ value }}</span></div>
                  <div class="affix-stats"><span class="stats-label">词条:</span><span v-for="(value, stat) in gameState.player.equipment.shoes.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">{{ getStatName(stat) }} +{{ value }}</span><span v-if="Object.keys(gameState.player.equipment.shoes.affixes || {}).length === 0" class="stat-badge empty-badge">无</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 装备背包 -->
        <div class="equipment-bag">
          <h4>🎒 装备背包</h4>
          <div class="equipment-grid">
            <div v-for="(equip, index) in gameState.player.equipmentBag" :key="equip.uid" class="equip-item" :style="{ borderColor: getRarityColor(equip.rarity) }">
              <div class="equip-header">
                <div class="equip-name" :style="{ color: getRarityColor(equip.rarity) }">Lv.{{ equip.level }} {{ equip.name }}</div>
                <div class="equip-rarity" :style="{ color: getRarityColor(equip.rarity) }">[{{ getRarityName(equip.rarity) }}]</div>
              </div>
              <div class="equip-stats">
                <div class="base-stats">
                  <span class="stats-label">基础:</span>
                  <span v-for="(value, stat) in equip.baseStats" :key="stat" class="stat-badge base-badge">
                    {{ getStatName(stat) }} +{{ value }}
                  </span>
                  <span v-if="Object.keys(equip.baseStats).length === 0" class="stat-badge empty-badge">
                    无
                  </span>
                </div>
                <div class="affix-stats">
                  <span class="stats-label">词条:</span>
                  <span v-for="(value, stat) in equip.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">
                    {{ getStatName(stat) }} +{{ value }}
                  </span>
                  <span v-if="Object.keys(equip.affixes || {}).length === 0" class="stat-badge empty-badge">
                    无
                  </span>
                </div>
              </div>
              <div class="equip-actions">
                <button class="equip-btn" @click="equipItem(equip, index)">穿戴</button>
                <button class="sell-btn" @click="sellEquipment(index)">丢弃</button>
              </div>
            </div>
          </div>
          <div v-if="gameState.player.equipmentBag.length === 0" class="empty-tip">
            装备背包空空如也，击败敌人有概率获得装备！
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { gameState, gameActions } from '../stores/gameStore.js'

const tooltipSlot = ref(null)
const activeItem = ref(null)

const showTooltip = (slot) => {
  if (gameState.player.equipment[slot]) {
    tooltipSlot.value = slot
  }
}

const hideTooltip = () => {
  tooltipSlot.value = null
}

const showItemTooltip = (item) => {
  activeItem.value = item
}

const hideItemTooltip = () => {
  activeItem.value = null
}

const useItem = (index) => {
  const item = gameState.player.inventory[index]
  if (item.type === 'heal') {
    const healAmount = Math.min(item.effect, gameState.player.maxHp - gameState.player.hp)
    gameState.player.hp += healAmount
    gameState.player.inventory[index].count--
    if (gameState.player.inventory[index].count <= 0) {
      gameState.player.inventory.splice(index, 1)
    }
    alert(`使用成功！恢复了 ${healAmount} 点生命值`)
  } else if (item.type === 'mana') {
    const manaAmount = Math.min(item.effect, gameState.player.maxMp - gameState.player.mp)
    gameState.player.mp += manaAmount
    gameState.player.inventory[index].count--
    if (gameState.player.inventory[index].count <= 0) {
      gameState.player.inventory.splice(index, 1)
    }
    alert(`使用成功！恢复了 ${manaAmount} 点法力值`)
  }
  hideItemTooltip()
}

const sellItem = (index) => {
  const price = Math.floor(gameState.player.inventory[index].value * 0.5)
  gameState.player.gold += price
  gameState.player.inventory.splice(index, 1)
  alert(`出售成功！获得 ${price} 金币`)
  hideItemTooltip()
}

const closePanel = () => {
  gameActions.setScreen('map')
}

const addPoint = (stat) => {
  gameActions.allocatePoints(stat, 1)
}

const restoreHp = () => {
  gameState.player.hp = gameState.player.maxHp
}

const restoreMp = () => {
  gameState.player.mp = gameState.player.maxMp
}

const getRarityColor = (rarity) => {
  const colors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  }
  return colors[rarity] || '#9ca3af'
}

const getStatName = (stat) => {
  const names = {
    physicalAttack: '物攻',
    magicAttack: '法攻',
    defense: '防御',
    speed: '速度',
    maxHp: '生命',
    maxMp: '法力',
  }
  return names[stat] || stat
}

const getRarityName = (rarity) => {
  const names = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return names[rarity] || '普通'
}

const getAffixColor = (stat, value) => {
  const thresholds = {
    physicalAttack: { low: 15, medium: 30, high: 50 },
    magicAttack: { low: 15, medium: 30, high: 50 },
    defense: { low: 10, medium: 20, high: 35 },
    speed: { low: 10, medium: 20, high: 35 },
    maxHp: { low: 100, medium: 200, high: 350 },
    maxMp: { low: 50, medium: 100, high: 200 },
  }
  
  const t = thresholds[stat] || { low: 10, medium: 20, high: 30 }
  
  if (value >= t.high) return '#f59e0b'
  if (value >= t.medium) return '#a855f7'
  if (value >= t.low) return '#3b82f6'
  return '#9ca3af'
}

const equipItem = (equipment, index) => {
  gameActions.equipItem(equipment, index)
}

const unequipItem = (slot) => {
  hideTooltip()
  gameActions.unequipItem(slot)
}

const sellEquipment = (index) => {
  gameActions.sellEquipment(index)
}
</script>

<style scoped lang="scss">
.character-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  
  h2 {
    margin: 0;
    color: white;
    font-size: 24px;
  }
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 107, 107, 0.3);
  }
}

.panel-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.section {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  
  h3 {
    margin: 0 0 20px;
    color: white;
    font-size: 18px;
  }
}

.basic-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .label { color: #888; }
  .value { color: white; font-weight: 500; }
}

.exp-bar {
  margin-bottom: 24px;
  
  .exp-label {
    color: #888;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .exp-bar-bg {
    height: 12px;
    background: #333;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .exp-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #22c55e);
    transition: width 0.3s;
  }
  
  .exp-text {
    text-align: right;
    color: #888;
    font-size: 12px;
    margin-top: 4px;
  }
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-label {
  color: #ccc;
  font-size: 14px;
}

.stat-value {
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.stat-add {
  button {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

.free-points {
  margin-top: 16px;
  padding: 12px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 8px;
  color: #4ade80;
  text-align: center;
  font-weight: 500;
}

.restore-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  padding: 16px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
}

.skill-name {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
}

.skill-type {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(168, 85, 247, 0.3);
  border-radius: 4px;
  color: #c084fc;
  font-size: 12px;
  margin-bottom: 6px;
}

.skill-cost {
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
}

.skill-desc {
  color: #aaa;
  font-size: 13px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.item-card {
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(245, 158, 11, 0.2);
    transform: scale(1.05);
  }
}

.item-icon {
  font-size: 36px;
}

.item-count-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #f59e0b;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 12px;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-width: 180px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(255, 255, 255, 0.2);
  }
}

.tooltip-item-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.tooltip-item-desc {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

.tooltip-item-value {
  font-size: 12px;
  color: #fbbf24;
  margin-bottom: 12px;
}

.tooltip-use-btn, .tooltip-sell-btn {
  width: 100%;
  padding: 6px;
  margin-bottom: 6px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.tooltip-use-btn {
  background: rgba(74, 222, 128, 0.3);
  color: #4ade80;
  
  &:hover {
    background: rgba(74, 222, 128, 0.5);
  }
}

.tooltip-sell-btn {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  
  &:hover {
    background: rgba(255, 107, 107, 0.5);
  }
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 40px 20px;
}

.equipment-section {
  h4 {
    margin: 16px 0 12px;
    color: #aaa;
    font-size: 14px;
  }
}

.equipment-slots {
  margin-bottom: 20px;
}

.slot-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.slot-item {
  width: 120px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  
  &.equipped {
    border-style: solid;
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
}

.slot-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.slot-label {
  display: block;
  color: #888;
  font-size: 12px;
  margin-bottom: 8px;
}

.slot-equip {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  
  .unequip-btn {
    display: block;
    margin-top: 4px;
    padding: 4px 8px;
    font-size: 10px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 107, 107, 0.5);
    }
  }
}

.equipment-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 12px;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-width: 200px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(255, 255, 255, 0.2);
  }
}

.tooltip-header {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-rarity {
  font-size: 12px;
  opacity: 0.8;
}

.tooltip-stats {
  .base-stats, .affix-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 4px;
  }
  
  .stats-label {
    font-size: 11px;
    color: #666;
    font-weight: bold;
  }
  
  .stat-badge {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 11px;
    color: #ccc;
  }
  
  .base-badge {
    color: #60a5fa;
  }
  
  .empty-badge {
    color: #666;
    font-style: italic;
  }
}

.equipment-bag {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.equip-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid;
  border-radius: 8px;
}

.equip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.equip-name {
  font-size: 14px;
  font-weight: bold;
}

.equip-rarity {
  font-size: 11px;
  opacity: 0.8;
}

.equip-stats {
  margin-bottom: 10px;
}

.base-stats, .affix-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 11px;
  color: #666;
  font-weight: bold;
}

.stat-badge {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: #ccc;
}

.base-badge {
  color: #60a5fa;
}

.empty-badge {
  color: #666;
  font-style: italic;
}

.equip-actions {
  display: flex;
  gap: 6px;
}

.equip-btn, .sell-btn {
  flex: 1;
  padding: 6px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.equip-btn {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  
  &:hover {
    background: rgba(59, 130, 246, 0.5);
  }
}

.sell-btn {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  
  &:hover {
    background: rgba(255, 107, 107, 0.5);
  }
}
</style>

