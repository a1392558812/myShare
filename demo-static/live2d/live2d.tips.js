/** live2d 加载类 */
import '@/static/live2d/waifu.scss'
import { createApp } from 'vue'
export default class Live2d_tips {
  constructor(config) {
    const { modelSrc, modelId, modelSite, actionTime, actionText, musicListId } = config

    this.modelSrc = modelSrc
    this.width = modelSite.width
    this.height = modelSite.height
    this.hOffset = modelSite.hOffset
    this.vOffset = modelSite.vOffset
    this.actionTime = actionTime
    this.actionText = actionText
    this.modelId = modelId
    this.musicListId = musicListId
    this.modelList = null

    if (modelSrc === null && modelId === undefined) {
      throw new Error('ModelID and ModelSrc 为空, 必须填写其一.')
    }
    switch (modelId) {
      case 0:
      case 1:
      case 2:
      case 3:
        this.executor()
        break
      default:
        throw new Error('ModelId 不符合规则 (id: 0 ~ 3)')
    }
  }

  executor() {
    this.loadWidget()
  }

  loadWidget() {
    if (this.modelSrc) {
      console.log(`location found ${this.modelSrc}`)
    } else {
      console.log('network to loading')
    }
    const vnode = createApp({
      render() {
        return (
          <div id="live2d-widget" class="waifu ui-draggable ui-draggable-handle">
            <div class="live2d-tips"></div>
            <canvas id="live2d" width={830 / 2.2} height={900 / 2.2}></canvas>
            <div class="live2d-tools">
              <span class="fa fa-lg fa-camera-retro"></span>
              <span class="fa fa-lg fa-music"></span>
              <span class="fa fa-lg fa-info-circle"></span>
              <span class="fa fa-lg fa-times"></span>
            </div>
            <div class="live2d-toggle">看板娘</div>
          </div>
        )
      }
    })
    const root = document.createElement('div')
    $('#live2d-widget-wrap')[0].appendChild(root)
    vnode.mount(root)
    this.setSite()

    let userAction = false
    let textTimer
    let actionTimer
    ;(function welcomeWidget() {
      const now = new Date().getHours()
      let text

      if (location.pathname !== '/') {
        if (now >= 5 && now < 7) {
          text = '早上好，我的主人'
        } else if (now >= 7 && now < 11) {
          text = '上午过的舒服吗？<span>不要太劳累哦。</span>'
        } else if (now >= 11 && now < 13) {
          text = '该吃午饭了，休息休息吧~'
        } else if (now >= 13 && now < 15) {
          text = '工作时间，喝杯茶<span>「提提神」</span>'
        } else if (now >= 15 && now < 17) {
          text = '完成的差不多了，赶紧收工吧!'
        } else if (now >= 17 && now < 19) {
          text = '吃晚饭咯，一天过得真快呀。'
        } else if (now >= 19 && now < 21) {
          text = '晚上好，今天过得这么样？'
        } else if (now >= 21 && now < 23) {
          text = '早点睡吧，对身体好，明天又是<span>「元气满满」</span>的一天'
        } else {
          text = '快点睡觉！再不睡觉，我生气了哦。'
        }
      }
      showMessage(text, 7000, 8)
    })()

    window.addEventListener('mousemove', () => (userAction = true))
    window.addEventListener('keydown', () => (userAction = true))

    setInterval(() => {
      if (userAction) {
        userAction = false
        clearInterval(actionTimer)
        actionTimer = null
      } else if (!actionTimer) {
        actionTimer = setInterval(() => {
          showMessage(this.actionText, 4000, 9)
        }, this.actionTime)
      }
    }, 2000)

    const musicArr = []
    let audio = null

    document.querySelector('#live2d-widget #live2d').addEventListener('click', () => {
      hitokoto('动画')
    })
    document.querySelector('#live2d-widget #live2d').addEventListener('mouseover', () => {
      const tools = document.querySelector('#live2d-widget .live2d-tools')

      tools.classList.add('active')
    })
    document
      .querySelector('#live2d-widget .live2d-tools')
      .addEventListener('mouseover', function () {
        this.classList.add('active')
      })
    document.querySelector('#live2d-widget #live2d').addEventListener('mouseout', () => {
      const tools = document.querySelector('#live2d-widget .live2d-tools')

      tools.classList.remove('active')
    })
    document.querySelector('.live2d-tools .fa-camera-retro').addEventListener('click', () => {
      showMessage('卡哇伊，合影留念吧~', 6000, 9)
      Live2D.captureName = 'photo.png'
      Live2D.captureFrame = true
    })
    document.querySelector('.live2d-tools .fa-music').addEventListener('click', () => {
      // 调用hitokoto提供的api
      fetch163Playlist(this.musicListId)
        .then((data) => {
          for (const music in data) {
            musicArr.push(data[music].url)
          }
          return musicArr
        })
        .then((music) => {
          if (audio) {
            audio.load()
          }
          audio = new Audio(randSection(music))
          audio.play()
        })
        .catch(console.error)
    })
    document.querySelector('.live2d-tools .fa-info-circle').addEventListener('click', () => {
      showMessage('Go go go~', 6000, 9)
      open('https://www.live2d.com/en/')
    })
    document.querySelector('.live2d-tools .fa-times').addEventListener('click', function () {
      const live2d = document.querySelector('#live2d-widget')

      live2d.style.bottom = '-500px'
      setTimeout(() => {
        live2d.style.display = 'none'
        document.querySelector('.live2d-toggle').classList.add('active')
      }, 2000)
    })
    document.querySelector('.live2d-toggle').addEventListener('click', () => {
      document.querySelector('.live2d-toggle').classList.remove('active')
      const live2d = document.querySelector('#live2d-widget')
      console.log(this.vOffset)
      live2d.style.display = 'block'
      setTimeout(() => {
        live2d.style.bottom = this.vOffset + 'px'
      }, 0)
    })

    function hitokoto(typeName) {
      let type
      switch (typeName) {
        case '动画':
          type = 'a'
          break
        case '漫画':
          type = 'b'
          break
        case '游戏':
          type = 'c'
          break
        default:
          typeName = '动画'
          type = 'a'
          break
      }
      fetch(`https://v1.hitokoto.cn/?c=${type}`)
        .then((response) => response.json())
        .then((result) => {
          const text = `来自${typeName} <span>「${result.from}」</span> 的留言`
          showMessage(result.hitokoto, 4000, 9)
          setTimeout(() => {
            showMessage(text, 4000, 9)
          }, 4000)
        })
    }

    const loadJSON = async (CDN) => {
      this.modelList = [
        '95type_405',
        'aa12_2403',
        'ads_3601',
        'ak12_3302',
        'an94_3303',
        'carcano1891_2201',
        'carcano1938_2202',
        'cbjms_3503',
        'contender_2302',
        'dsr50_1801',
        'dsr50_2101',
        'fn57_2203',
        'g36_2407',
        'g36c_1202',
        'g41_2401',
        'gelina',
        'grizzly_2102',
        'hk416_805',
        'hk416_3401',
        'k2_3301',
        'kp31_310',
        'kp31_1103',
        'kp31_3101',
        'lewis_3502',
        'm950a_2303',
        'm1928a1_1501',
        'mlemk1_604',
        'ntw20_2301',
        'ots14_1203',
        'ots14_3001',
        'pkp_1201',
        'px4storm_2801',
        'r93_3501',
        'rfb_1601',
        'sat8_2601',
        'sat8_3602',
        'type64-ar_2901',
        'type88_3504',
        'ump9_3404',
        'ump45_3403',
        'vector_1901',
        'wa2000_6',
        'welrod_1401'
      ]
    }

    const loadModel = async (
      CDN = window.location.origin + window.location.pathname + 'demo-static/live2d-model'
    ) => {
      if (!this.modelSrc) {
        await loadJSON(CDN)
        const target = this.modelList[this.modelId]
        loadlive2d('live2d', `${CDN}/${target}/${target}.model.json`)
      } else {
        loadlive2d('live2d', this.modelSrc)
      }
    }

    function randSection(obj) {
      return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj
    }

    function showMessage(text, timeout, protery) {
      if (
        !text ||
        (sessionStorage.getItem('tips-text') && sessionStorage.getItem('tips-text') > protery)
      ) {
        return
      }

      if (textTimer) {
        clearTimeout(textTimer)
        textTimer = null
      }
      sessionStorage.setItem('tips-text', protery)
      const tips = document.querySelector('#live2d-widget .live2d-tips')
      const tip = randSection(text)
      tips.innerHTML = tip
      tips.classList.add('active')

      textTimer = setTimeout(() => {
        tips.classList.remove('active')
        sessionStorage.removeItem('tips-text')
      }, timeout)
    }

    const devtools = () => {}
    console.log('%c', devtools)
    devtools.toString = () => {
      showMessage(
        'Live2d 有官网文档哦 ~ 请访问 <span>「https://www.live2d.com/en/」</span>',
        4000,
        9
      )
    }
    window.addEventListener('copy', () => {
      showMessage('你想获得力量吗？', 4000, 9)
    })
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) showMessage('你还好吗，担心死你了~', 4000, 9)
    })

    loadModel()
  }

  setSite() {
    const live2d = document.querySelector('#live2d-widget')
    setTimeout(() => {
      live2d.style.bottom = this.vOffset + 'px'
      live2d.style.left = this.hOffset + 'px'
      live2d.style.width = this.width + 'px'
      live2d.style.height = this.height + 'px'
    }, 0)
  }
}
