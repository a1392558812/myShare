<template>
  <div class="rotate-expand">
    <div class="rotate-expand-container" @mouseenter="handleHover" @mouseleave="handleLeave">
      <div v-for="(value, index) in source" :key="value" :style="targetStyle(index)" class="card"
        @click="handleCardClick(index)">
        <span class="card-text">{{ value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const source = ref('落霞与孤鹜齐飞'.split('').reverse())
const isHover = ref(false)
const clickedIndex = ref(null)

const targetStyle = (index) => {
  const currentIndex = Math.floor(source.value.length / 2)
  const diff = index - currentIndex
  const diffAngle = 120 / source.value.length

  const defaultStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
    transformOrigin: '50% 100%',
    transition: 'all 0.5s ease-in-out',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: index,
    backfaceVisibility: 'visible',
    perspective: '1000px'
  }

  if (!isHover.value) {
    return Object.assign({}, defaultStyle, {
      backgroundColor: '#ff6b6b',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: '8px 8px 0 0',
      marginTop: 0
    })
  }

  const baseStyle = Object.assign({}, defaultStyle, {
    transform: `rotate(${-diff * diffAngle}deg)`,
    backgroundColor: `hsl(${index * 30}, 70%, 60%)`,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginTop: 0
  })

  if (clickedIndex.value === index) {
    return Object.assign({}, baseStyle, {
      transform: `rotate(${-diff * diffAngle}deg) translateY(-60%)`,
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    })
  }

  return baseStyle
}

const handleHover = () => {
  isHover.value = true
}

const handleLeave = () => {
  isHover.value = false
  clickedIndex.value = null
}

const handleCardClick = (index) => {
  if (clickedIndex.value === index) {
    clickedIndex.value = null
  } else {
    clickedIndex.value = index
  }
}
</script>

<style lang="scss" scoped>
.rotate-expand {
  width: 100%;
  min-height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;

  .rotate-expand-container {
    width: 200px;
    height: 350px;
    position: relative;
    transform-style: preserve-3d;

    .card {
      transition: all 0.3s ease-in-out;

      &:hover {
        filter: brightness(1.1);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      .card-text {
        font-size: 18px;
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease-in-out;
        transform: translateZ(10px);
      }
    }
  }
}
</style>