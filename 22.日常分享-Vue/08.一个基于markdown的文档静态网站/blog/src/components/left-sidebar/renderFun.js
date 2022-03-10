/**
 * @desc 这个函数单纯是占地方提出来的，与left.sidebar耦合
 * @returns {renderFun}
 */
export default function () {
  const renderFun = ({ item, grade, list, firstLevelIndex, ifShow = true }) => {
    if (!item) return null
    grade++
    const renderList = item && item.children ? item.children : []
    // 列表点击
    const listClick = (e) => {
      e.stopPropagation()
      item.ifShow = !item.ifShow
      item.ifHadRender = true
      this.nowActive = firstLevelIndex
    }
    // 子项点击
    const itemClick = (e) => {
      e.stopPropagation()
      if (this.$route.query.indexPage !== item.indexPage) {
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
    const titleStyleName = () => {
      return { marginLeft: `${grade * 25}px` }
    }
    const listItemStyle = () => {
      return { display: `${ifShow ? '' : 'none'}` }
    }
    const ifRender = () => {
      return ('ifHadRender' in item) &&
        item.ifHadRender &&
        'ifShow' in item
    }
    return (<>
      {
        (item && item.name) ? (
          <div
            className={className()}
            style={listItemStyle()}
            onClick={renderList.length ? (e) => {
              listClick(e)
            } : (e) => {
              itemClick(e)
            }}
            key={item.index}>
            {grade === 0 && this.nowActive === firstLevelIndex ? (<div className='list-active'></div>) : null}
            <div style={titleStyleName()} className='cell-item-title'>
              {item.link ? (<div className='cell-item-link'>链接</div>) : null}
              {item.name}
              {item.topping ? (<div className='topping'>置顶</div>) : null}
            </div>
            {ifRender() ? renderList.map((child, childIndex) => {
              return (<renderFun
                item={child}
                list={renderList}
                key={childIndex}
                ifShow={item.ifShow}
                firstLevelIndex={firstLevelIndex}
                grade={grade}></renderFun>)
            }) : null }
          </div>
        ) : null
      }
    </>)
  }
  return renderFun
}
