/**
 * @desc 这个函数单纯是占地方提出来的，与left.sidebar耦合
 * @returns {renderFun}
 */
export default function () {
  const renderFun = ({ item, grade, list, firstLevelIndex }) => {
    if (!item) return null
    grade++
    const renderList = item && item.children ? item.children : []
    // 列表点击
    const listClick = () => {
      item.ifShow = !item.ifShow
      this.nowActive = firstLevelIndex
    }
    // 子项点击
    const itemClick = () => {
      this.nowActive = firstLevelIndex
      list.map(child => {
        child.itemActive = false
        return child
      })
      item.itemActive = true
      this.toggleMenu(false)
      this.$router.push({
        path: '/',
        query: { indexPage: item.indexPage }
      })
      this.$emit(item.link ? 'linkClick' : 'itemClick', item.link ? item.link : item.url)
    }
    const className = () => {
      let className = 'cursor-pointer cell'
      if (item.link) {
        className = `${className} link-cell`
      } else {
        className = `${className} ${renderList.length ? 'list-cell' : 'item-cell'}`
      }
      if (item.itemActive) {
        className = `${className} item-active`
      }
      return className
    }
    return (<>
      <div
        className={className()}
        onclick={renderList.length ? () => { listClick() } : () => { itemClick() }}
        style={{ marginLeft: `${grade * 25}px` }}
        key={item.index}>
        { grade === 0 && this.nowActive === firstLevelIndex ? (<div className='list-active'></div>) : null }
        <div className='cell-item'>
          { item.link ? (<div class='cell-item-link'>链接</div>) : null}
          {item.name}
          { item.topping ? (<div className='topping'>置顶</div>) : null}
        </div>
      </div>
      {('ifShow' in item && item.ifShow) ? renderList.map((child, childIndex) => {
        return (<renderFun
          item={child}
          list={renderList}
          key={childIndex}
          firstLevelIndex={firstLevelIndex}
          grade={grade}></renderFun>)
      }) : null }
    </>)
  }
  return renderFun
}
