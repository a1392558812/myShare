<template>
  <div class="width100 height100">
    <div>
      <kinesis-container :audio="audio" :playAudio="playAudio">
        <kinesis-element class="relative music-content" :strength="20" type="depth">
          <kinesis-audio class="music-content-cover absolute" :audioIndex="50" :strength="75" type="scale">
            <img class="img" :src="require('@/assets/music/music-bg.jpg')" alt="">
          </kinesis-audio>
          <kinesis-audio class="music-content-cover absolute" :audioIndex="50" :strength="75" type="scale">
            <img class="img" :src="require('@/assets/music/music-bg.jpg')" alt="">
          </kinesis-audio>
          <kinesis-audio class="music-content-cover absolute" :audioIndex="50" :strength="75" type="scale">
            <img class="img" :src="require('@/assets/music/music-bg.jpg')" alt="">
          </kinesis-audio>
          <kinesis-audio class="music-content-cover absolute" :audioIndex="50" :strength="75" type="scale">
            <img class="img" :src="require('@/assets/music/music-bg.jpg')" alt="">
          </kinesis-audio>
        </kinesis-element>
      </kinesis-container>
    </div>
    <div @click="playAudio = !playAudio">播</div>
  </div>
</template>

<script>
import { KinesisContainer, KinesisElement, KinesisAudio } from 'vue-kinesis'
import { ref } from 'vue'
export default {
  name: 'music',
  components: {
    KinesisContainer,
    KinesisAudio,
    KinesisElement
  },
  setup () {
    return {
      audio: ref(require('@/assets/music/森永真由美 (もりなが まゆみ) - 色は匂へど 散りぬるを (花朵艳丽 终会散落).mp3')),
      playAudio: ref(false)
    }
  }
}
</script>

<style scoped lang="scss">
  .music-content{
    width: 300px;
    height: 300px;
    .music-content-cover{

    }
  }
.img{
  width: 200px;
}
</style>
