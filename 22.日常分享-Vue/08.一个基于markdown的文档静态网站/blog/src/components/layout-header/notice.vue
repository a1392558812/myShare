<script>
import { notice, noticeTitle } from '@/static/notice'
import { reactive, ref, toRefs } from 'vue'
export default {
  name: 'notice',
  props: {
    showPopup: {
      type: Boolean,
      default: false
    },
    ifLarger: {
      type: Boolean,
      default: true
    }
  },
  setup (props, { emit }) {
    const { showPopup } = toRefs(props)
    return {
      notice: reactive(notice),
      noticeTitle: ref(noticeTitle),
      handelClick: () => emit('update:showPopup', !showPopup.value)
    }
  },
  render () {
    return (
      <>
        {
        /* 弹出层 */
          this.showPopup
            ? (
              <>
                <div onClick={this.handelClick} className={`absolute popup ${this.ifLarger ? 'popup-pc' : 'fixed popup-phone'}`}>
                  <div className="popup-inner flex flex-direction-column">
                    <p className="title flex align-items-center justify-content-center">{noticeTitle}</p>
                    <p className="cell">如有疑问联系我QQ:1392558812</p>
                    { notice.map((item, index) => (<p key={index} className="cell">{index + 1}.{item}</p>)) }
                  </div>
                </div>
                <div className="mask" onClick={this.handelClick}></div>
              </>
            ) : null
        }
      </>
    )
  }
}
</script>

<style scoped lang="scss">
  .popup-pc{
    right: 20px;
    top: calc(100% + 15px);
    &::after{
      display: block;
      content: '';
      position: absolute;
      width: 17px;
      height: 17px;
      top: 0;
      transform: translate(-20px, -50%) rotate(45deg);
      right: 0;
      background-color: #fff;
      border-top: 1px solid #eee;
      border-left: 1px solid #eee;
      z-index: 1;
    }
  }
  .popup-phone{
    top: 50%;
    left: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .popup{
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 5px;
    .popup-inner{
      position: relative;
      line-height: 1;
      padding: 0 10px;
      z-index: 10;
      .title{
        line-height: 1;
        padding: 15px 20px;
        font-weight: 600;
        margin: 0;
        border-bottom: 1px solid #eee;
        white-space:nowrap;
      }
      .cell{
        padding: 10px 15px;
        white-space:nowrap;
        margin: 0;
      }
    }
  }
  .mask{
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
  }
</style>
