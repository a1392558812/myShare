<script>
import list from '@/static/list.js'
import { reactive, ref, computed } from 'vue'
import leftSidebarProps from '@/common/util/left-sidebar-props'
import renderList from '@/common/util/renderList'
import leftSidebarRenderFactoryFun from './renderFun'
import leftSidebarSearch from './left-sidebar-search'

export default {
  name: 'left-sidebar',
  props: {
    ...leftSidebarProps
  },
  setup (props) {
    return {
      list: reactive(renderList(list)),
      nowActive: ref(null),
      sidebarClassName: computed(() => {
        let classname = 'left-sidebar bg-white height100'
        if (!props.ifLarger) {
          classname = `${classname} absolute width-auto ${props.ifShowMenu ? 'translateX-0' : 'translateX-100'}`
        }
        return classname
      })
    }
  },
  render () {
    const renderFun = leftSidebarRenderFactoryFun.bind(this)()
    return (
      <div className={this.sidebarClassName}>
        <leftSidebarSearch
          toggleMenu={this.toggleMenu}
          onSearchLinkClick={(link) => { this.$emit('linkClick', link) }}
          onSearchItemClick={(url) => { this.$emit('itemClick', url) }}
          list={this.list}/>
        {
          this.list.map((item, index) => {
            return <renderFun
              item={item}
              key={index}
              grade={-1}
              list={this.list}
              url={[item.name]}
              firstLevelIndex={index}></renderFun>
          })
        }
      </div>
    )
  }
}
</script>

<style scoped lang="scss">
.left-sidebar{
  width: v-bind(leftSidebarW);
  flex-shrink: 0;
  transition: transform 0.3s;
  overflow-y: scroll;
  border-right: 1px solid #eee;
  padding: 0 20px 30px 20px;
  z-index: 10;
  ::v-deep(.cell){
    border-bottom: 1px solid #eee;
    line-height: 1.5;
    .cell-item{
      .cell-item-link{
        margin: 5px;
        height: 14px;
        border-radius: 5px;
        padding: 5px 10px;
        display: inline-block;
        font-size: 14px;
        line-height: 1;
        white-space:nowrap;
        background-color: skyblue;
        color: #fff;
      }
    }
    .topping{
      margin: 5px;
      height: 14px;
      border-radius: 5px;
      padding: 5px 10px;
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      white-space:nowrap;
      background-color: #42b983;
      color: #fff;
    }
  }
  ::v-deep(.list-cell){
    position: relative;
    z-index: 0;
    color: #000;
    padding: 20px 0;
    font-size: 18px;
    font-weight: 600;
    .list-active{
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      border-radius: 200px;
      height: 20px;
      background-color: #42b983;
    }
  }
  ::v-deep(.item-cell){
    color: #505d6b;
    padding: 10px 0;
    font-size: 16px;
    font-weight: 400;
    &:hover{
      color: #42b983;
    }
  }
  ::v-deep(.link-cell){
    color: #006895;
  }
  ::v-deep(.item-active){
    color: #42b983;
  }
}
</style>
