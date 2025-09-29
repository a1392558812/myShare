<template>
  <div class="offline-game-wrap">
    <div class="offline-game">
      <canvas ref="gameCanvas" width="800" height="300"></canvas>

      <div v-if="gameState === 'playing'" class="lives-display">
        <span class="life" v-for="i in lives" :key="i">❤️</span>
      </div>

      <div v-if="gameState === 'start'" class="game-overlay start-screen">
        <p>按下空格键开始游戏</p>
        <p>使用空格键跳跃，躲避障碍物</p>
        <p>收集金币和水果获得分数！</p>
      </div>

      <div v-if="gameState === 'gameOver'" class="game-overlay end-screen">
        <h2>游戏结束</h2>
        <p>得分: {{ score }}</p>
        <p>最高得分: {{ highScore }}</p>
        <p>按下空格键重新开始</p>
      </div>

      <div v-if="gameState === 'playing'" class="score-display">
        <span>得分: {{ score }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 游戏状态
const gameState = ref('start') // 'start', 'playing', 'gameOver'
const score = ref(0)
const lastScore = ref(0) // 上一次累计的分数

const highScore = ref(0)
const lives = ref(3)


const gameCanvas = ref(null)
let ctx = null
let animationId = null
let lastTime = 0
let speed = 5

const dino = {
  x: 50,
  y: 200,
  width: 50,
  height: 50,
  jumping: false,
  jumpHeight: 120,
  jumpSpeed: 0,
  gravity: 0.5,
  ground: 200
}

const obstacles = []
const obstaclesSpawnRate = 1500 // ms
let lastObstacleTime = 0

// 收集物品
const collectibles = []
const collectiblesSpawnRate = 2000 // ms
let lastCollectibleTime = 0

const ground = {
  y: 250,
  height: 50,
  x: 0,
  width: 800
}

const cloud = {
  x: 800,
  y: 50,
  width: 100,
  height: 50,
  speed: 0.5
}

const collectibleTypes = [
  { type: 'coin', points: 100, color: '#ffd700', radius: 10, chance: 0.6 },
  { type: 'apple', points: 200, color: '#ff6347', radius: 12, chance: 0.3 },
  { type: 'diamond', points: 500, color: '#4682b4', radius: 8, chance: 0.1 }
]
const jumpSound = () => {
  // 可以在这里添加音效或者一些画面效果,，这里只起一个抛砖引玉的效果
  console.log('挑起')
}

const gameOverSound = () => {
  // 同上jumpSound注释
  console.log('游戏结束')
}

const collectSound = () => {
  // 同上jumpSound注释
  console.log('收集到了物品')
}

const lifeUpSound = () => {
  // 同上jumpSound注释
  console.log('获得♥♥')
}

onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d')

    // 缓存的最高分
    const savedHighScore = localStorage.getItem('dinoGameHighScore')
    if (savedHighScore) {
      highScore.value = parseInt(savedHighScore)
    }

    drawStartScreen()

    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const handleKeyDown = (e) => {
  if (e.code === 'Space') {
    e.preventDefault()

    if (gameState.value === 'start') {
      startGame()
    } else if (gameState.value === 'playing') {
      if (!dino.jumping) {
        jump()
      }
    } else if (gameState.value === 'gameOver') {
      resetGame()
      startGame()
    }
  }
}

// 开始游戏
const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  lives.value = 3
  lastScore.value = 0
  speed = 5
  obstacles.length = 0
  collectibles.length = 0
  lastObstacleTime = performance.now()
  lastCollectibleTime = performance.now()

  lastTime = performance.now()
  gameLoop(lastTime)
}

const resetGame = () => {
  // 重置恐龙位置
  dino.y = dino.ground
  dino.jumping = false
  dino.jumpSpeed = 0

  // 重置障碍物和收集物品
  obstacles.length = 0
  collectibles.length = 0

  cloud.x = 800
}

// 游戏结束
const endGame = () => {
  gameState.value = 'gameOver'
  gameOverSound()

  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem('dinoGameHighScore', highScore.value.toString())
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  drawGameOverScreen()
}

// 失去生命
const loseLife = () => {
  lives.value--
  if (lives.value <= 0) {
    endGame()
  } else {
    // 同上jumpSound注释
    console.log('失去♥:', lives.value)
  }
}

// 获得生命
const gainLife = () => {
  lives.value++
  lifeUpSound()
}

// 恐龙跳跃
const jump = () => {
  dino.jumping = true
  dino.jumpSpeed = -12
  jumpSound()
}

// 生成障碍物
const spawnObstacle = (currentTime) => {
  if (currentTime - lastObstacleTime > obstaclesSpawnRate) {
    const isCactus = Math.random() > 0.2 // 80%概率是仙人掌，20%概率是飞鸟

    const obstacle = {
      x: 800,
      y: isCactus ? 220 : 170 - Math.random() * 50, // 仙人掌在地面，飞鸟在空中随机位置
      width: isCactus ? 30 : 40,
      height: isCactus ? 30 : 30,
      type: isCactus ? 'cactus' : 'bird'
    }

    obstacles.push(obstacle)
    lastObstacleTime = currentTime

    if (score.value > 0 && score.value % 100 === 0) {
      speed += 0.5
    }
  }
}

// 生成收集物品
const spawnCollectible = (currentTime) => {
  if (currentTime - lastCollectibleTime > collectiblesSpawnRate) {
    // 随机选择收集物品类型
    let rand = Math.random()
    let selectedType = collectibleTypes[0]

    for (const type of collectibleTypes) {
      if (rand < type.chance) {
        selectedType = type
        break
      }
      rand -= type.chance
    }

    const minY = 120
    const maxY = 220
    const y = Math.random() * (maxY - minY) + minY

    const collectible = {
      x: 800,
      y: y,
      radius: selectedType.radius,
      type: selectedType.type,
      points: selectedType.points,
      color: selectedType.color,
      collected: false
    }

    collectibles.push(collectible)
    lastCollectibleTime = currentTime
  }
}

// 检测碰撞
const checkCollision = () => {
  for (const obstacle of obstacles) {
    if (dino.x < obstacle.x + obstacle.width &&
      dino.x + dino.width > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + dino.height > obstacle.y) {
      return true
    }
  }
  return false
}

// 检测收集物品碰撞
const checkCollectibles = () => {
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const collectible = collectibles[i]
    if (collectible.collected) continue

    // 计算恐龙和收集物品之间的距离
    const dx = (dino.x + dino.width / 2) - (collectible.x + collectible.radius)
    const dy = (dino.y + dino.height / 2) - (collectible.y + collectible.radius)
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 如果距离小于两者半径之和，视为碰撞（收集）
    if (distance < collectible.radius + dino.width / 2) {
      collectible.collected = true
      score.value += collectible.points
      collectSound()
    }

    // 移除已收集的物品
    if (collectible.collected || collectible.x + collectible.radius < 0) {
      collectibles.splice(i, 1)
    }
  }
}

// +生命检测
const addLifeFunc = () => {
  if (score.value - lastScore.value >= 2000) {
    gainLife()
    lastScore.value = score.value
  }
}

// 游戏主循环桢
const gameLoop = (timestamp) => {
  const deltaTime = timestamp - lastTime
  lastTime = timestamp

  ctx.clearRect(0, 0, 800, 300)

  const scoreIncrease = Math.max(1, Math.floor(deltaTime / 100))
  score.value = Math.max(0, score.value + scoreIncrease)

  drawBackground()

  drawGround()

  updateAndDrawCloud(deltaTime)

  spawnObstacle(timestamp)

  spawnCollectible(timestamp)

  updateAndDrawCollectibles(deltaTime)

  updateAndDrawObstacles(deltaTime)

  updateAndDrawDino(deltaTime)

  checkCollectibles()

  addLifeFunc()

  // 检测碰撞
  if (checkCollision()) {
    loseLife()
    if (lives.value > 0) {

      obstacles.length = 0 // 清除当前屏幕上的所有障碍物作为惩罚后的奖励

      animationId = requestAnimationFrame(gameLoop) // 继续游戏
    }
    return
  }

  animationId = requestAnimationFrame(gameLoop)
}

// 绘制开始界面
const drawStartScreen = () => {
  ctx.clearRect(0, 0, 800, 300)

  drawBackground()

  drawGround()

  drawDino()

  ctx.fillStyle = '#555'
  ctx.textAlign = 'center'
  ctx.font = '16px sans-serif'
  ctx.fillText('按下空格键开始游戏', 400, 100)
  ctx.fillText('使用空格键跳跃，躲避障碍物', 400, 130)
  ctx.fillText('收集金币和水果获得分数！', 400, 160)
}

// 绘制游戏结束界面
const drawGameOverScreen = () => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillRect(0, 0, 800, 300)

  ctx.fillStyle = '#555'
  ctx.font = '36px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('游戏结束', 400, 100)
  ctx.font = '24px sans-serif'
  ctx.fillText(`得分: ${score.value}`, 400, 140)
  ctx.fillText(`最高得分: ${highScore.value}`, 400, 170)
  ctx.font = '16px sans-serif'
  ctx.fillText('按下空格键重新开始', 400, 220)
}

// 绘制天空背景
const drawBackground = () => {
  ctx.fillStyle = '#f7f7f7'
  ctx.fillRect(0, 0, 800, 300)
}

// 绘制地面
const drawGround = () => {
  ctx.fillStyle = '#ded895'
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height)

  ctx.strokeStyle = '#b5a95d'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(ground.x, ground.y)
  ctx.lineTo(ground.x + ground.width, ground.y)
  ctx.stroke()
}

// 更新和绘制云朵
const updateAndDrawCloud = (deltaTime) => {
  cloud.x -= cloud.speed * deltaTime * 0.1

  // 如果云朵移出屏幕，重置位置
  if (cloud.x + cloud.width < 0) {
    cloud.x = 800
    cloud.y = 30 + Math.random() * 70 // 随机高度
  }

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cloud.x + 20, cloud.y + 25, 20, 0, Math.PI * 2)
  ctx.arc(cloud.x + 50, cloud.y + 20, 25, 0, Math.PI * 2)
  ctx.arc(cloud.x + 80, cloud.y + 25, 20, 0, Math.PI * 2)
  ctx.fill()
}

// 更新和绘制收集物品
const updateAndDrawCollectibles = (deltaTime) => {
  for (const collectible of collectibles) {
    if (collectible.collected) continue

    // 更新位置
    collectible.x -= speed * deltaTime * 0.1

    ctx.fillStyle = collectible.color
    ctx.beginPath()
    ctx.arc(collectible.x + collectible.radius, collectible.y + collectible.radius, collectible.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.beginPath()
    ctx.arc(collectible.x + collectible.radius * 0.7, collectible.y + collectible.radius * 0.7, collectible.radius * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 更新和绘制障碍物
const updateAndDrawObstacles = (deltaTime) => {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i]

    // 更新位置
    obstacle.x -= speed * deltaTime * 0.1

    // 绘制障碍物
    ctx.fillStyle = '#4a4a4a'

    if (obstacle.type === 'cactus') {
      // 绘制仙人掌
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

      ctx.fillStyle = '#2d2d2d'
      ctx.beginPath()
      ctx.moveTo(obstacle.x, obstacle.y)
      ctx.lineTo(obstacle.x - 10, obstacle.y - 5)
      ctx.lineTo(obstacle.x, obstacle.y - 5)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(obstacle.x + obstacle.width, obstacle.y)
      ctx.lineTo(obstacle.x + obstacle.width + 10, obstacle.y - 5)
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y - 5)
      ctx.fill()
    } else {
      // 绘制飞鸟
      ctx.beginPath()
      ctx.arc(obstacle.x + 20, obstacle.y + 15, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#3a3a3a'
      ctx.beginPath()
      ctx.moveTo(obstacle.x + 25, obstacle.y + 15)
      ctx.lineTo(obstacle.x + 45, obstacle.y + 5)
      ctx.lineTo(obstacle.x + 45, obstacle.y + 25)
      ctx.fill()
    }

    // 移除屏幕外的障碍物
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1)
    }
  }
}

// 更新恐龙
const updateAndDrawDino = (deltaTime) => {
  // 处理跳跃
  if (dino.jumping) {
    dino.y += dino.jumpSpeed
    dino.jumpSpeed += dino.gravity

    // 如果落地
    if (dino.y >= dino.ground) {
      dino.y = dino.ground
      dino.jumping = false
    }
  }

  drawDino()
}

// 绘制恐龙
const drawDino = () => {
  ctx.fillStyle = '#333'

  // 身体
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height)

  // 眼睛
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(dino.x + 40, dino.y + 15, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(dino.x + 43, dino.y + 15, 2, 0, Math.PI * 2)
  ctx.fill()

  /** 以下部分精益求精可以实现，我就实现了个大概是个意思就行 */
  // 腿
  ctx.fillStyle = '#333'
  if (!dino.jumping) {
    // 站立姿势
    ctx.fillRect(dino.x + 10, dino.y + 45, 5, 5)
    ctx.fillRect(dino.x + 35, dino.y + 45, 5, 5)
  } else {
    // 跳跃姿势
    ctx.fillRect(dino.x + 10, dino.y + 40, 5, 10)
    ctx.fillRect(dino.x + 35, dino.y + 40, 5, 10)
  }

  // 手臂
  ctx.fillRect(dino.x + 45, dino.y + 15, 8, 5)
}
</script>

<style scoped lang="scss">
.offline-game-wrap {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;

  .offline-game {
    position: relative;
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    canvas {
      border: 2px solid #333;
      background-color: #f7f7f7;
      display: block;
    }

    .game-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.9);
    }

    .start-screen {
      h1 {
        color: #555;
        margin-bottom: 20px;
        font-size: 36px;
      }

      p {
        color: #555;
        margin: 8px 0;
        font-size: 18px;
      }
    }

    .end-screen {
      h2 {
        color: #e74c3c;
        margin-bottom: 20px;
        font-size: 36px;
      }

      p {
        color: #555;
        margin: 8px 0;
        font-size: 18px;
      }
    }

    .score-display {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 16px;
    }

    .lives-display {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 5px;
      padding: 5px;

      .life {
        font-size: 24px;
        animation: pulse 2s infinite;
      }
    }
  }
}


@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
