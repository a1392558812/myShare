<script>
import { ref, watch, nextTick, onMounted } from 'vue'
import navigatorTitle from './navigator-title'

export default {
  name: 'markdown',
  components: {
    navigatorTitle
  },
  props: {
    headerH: {
      type: String,
      default: '70px'
    },
    loading: {
      type: Boolean,
      default: true
    },
    ifLarger: {
      type: Boolean,
      default: true
    },
    htmlMD: {
      type: String,
      default: ''
    },
    markdownTitleWidth: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const preview = ref(null) // markdown引用
    const articleTitles = ref([]) // markdown编辑器预览锚点标题
    const markdownMinHeight = ref('calc(100% - 170px)') // markdown区域的高度

    // 锚点标题动态设定
    const articleTitlesInit = () => {
      const anchors = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6')
      const previewTitles = Array.from(anchors).filter((title) => !!title.innerText.trim())
      if (!previewTitles.length) {
        articleTitles.value = []
        return
      }
      const hTags = Array.from(new Set(previewTitles.map((title) => title.tagName))).sort()
      articleTitles.value = previewTitles.map((el) => ({
        title: el.innerText,
        lineIndex: el.getAttribute('data-v-md-line'),
        indent: hTags.indexOf(el.tagName)
      }))
    }

    // markdown部分高度动态设定
    const setMarkdownMinHeight = () => {
      console.log('markdown部分高度动态设定')
      markdownMinHeight.value = `calc(100% - ${100 + $('.home .title').outerHeight()}px)`
    }

    // 锚点标题动态设定
    watch(() => props.htmlMD, () => nextTick(() => {
      articleTitlesInit()
    }))

    // markdown部分高度动态设定
    watch(() => props.title, () => {
      setMarkdownMinHeight()
    })

    // 初始化markdown部分高度动态设定
    onMounted(setMarkdownMinHeight)

    return {
      preview,
      articleTitles,
      markdownMinHeight,
      handelClick: (e) => {
        let target = $(e.target)
        if (target.hasClass('v-md-copy-code-btn')) {
          let oldNode = target.html()
          let oldStyle = {
            width: target.width(),
            height: target.height(),
            lineHeight: target.css('line-height')
          }
          target.html('复制成功')
          target.css({ width: '5em', height: '2em', lineHeight: '1.5em', transition: 'all 0.3s' })
          setTimeout(() => {
            target.css(oldStyle)
            target.html(oldNode)
            target = null
            oldNode = null
            oldStyle = null
          }, 1000)
          console.log('点击了button', oldNode, oldStyle)
        } else {
          target = null
        }
      },
      handleCopyCodeSuccess: (code) => {
        console.log('复制成功奥利给！！！', code)
      },
      handleAnchorClick: (anchor) => {
        const { lineIndex } = anchor
        let heading = preview.value.$el.querySelector(`[data-v-md-line="${lineIndex}"]`)
        if (heading) {
          preview.value.scrollToTarget({
            target: heading,
            scrollContainer: $('.home')[0],
            top: 30
          })
        }
        heading = null
      }
    }
  },
  render () {
    return (
      <>
        <div
          style={this.ifLarger && this.articleTitles.length ? { width: `calc(100% - ${this.markdownTitleWidth})` } : { width: '100%' }}
          className="title flex align-items-center justify-content-center">
          { this.title }
        </div>
        <div
          className="relative markdown"
          style={{ minHeight: this.markdownMinHeight }}
          v-loading={this.loading}>
          {
            !this.loading ? (
              <div className="flex height100">
                <v-md-preview
                  style={this.ifLarger && this.articleTitles.length ? { width: `calc(100% - ${this.markdownTitleWidth})` } : { width: '100%' }}
                  onClick={this.handelClick}
                  onCopy-code-success={this.handleCopyCodeSuccess}
                  ref="preview"
                  text={this.htmlMD}/>
                {
                  this.ifLarger ? (
                    <navigator-title
                      ifLarger={this.ifLarger}
                      markdownTitleWidth={this.markdownTitleWidth}
                      articleTitles={this.articleTitles}
                      onHandleAnchorClick={(anchor) => { this.handleAnchorClick(anchor) }}/>
                  ) : null
                }
              </div>
            ) : null
          }
        </div>
      </>
    )
  }
}
</script>

<style scoped lang="scss">
  .markdown{
    width: 100%;
    padding-bottom: 100px;
    z-index: 0;
  }
  .title{
    box-sizing: border-box;
    padding: 20px 30px;
    font-size: 18px;
    font-weight: 600;
  }
</style>
