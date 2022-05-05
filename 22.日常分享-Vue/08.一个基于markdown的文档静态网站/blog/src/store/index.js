import { createStore } from 'vuex'

export default createStore({
  state: {
    musicList: [
      {
        name: '风姿花伝 (风姿花传)',
        author: '谷村新司 (たにむら しんじ)',
        image: require('@/assets/music/music-bg3.jpg'),
        url: require('@/assets/music/music3.mp3')
      },
      {
        name: '色は匂へど 散りぬるを (花朵艳丽 终会散落)',
        author: '森永真由美 (もりなが まゆみ)',
        image: require('@/assets/music/music-bg1.jpg'),
        url: require('@/assets/music/music1.mp3')
      },
      {
        name: '广寒宫 - 《梦幻西游》月宫门派曲',
        author: '吴碧霞',
        image: require('@/assets/music/music-bg2.jpg'),
        url: require('@/assets/music/music2.mp3')
      }
    ]
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
