const renderList = (list, parentIndex = 0, url = []) => {
  return list.map((item, index) => {
    item.indexPage = parentIndex ? `${parentIndex}-${index}` : `${index}`
    item.url = url.length ? [...url, item.name] : [item.name]
    if (item.children) {
      item.ifShow = false
      renderList(item.children, item.indexPage, item.url)
    } else {
      item.itemActive = false
    }
    return item
  })
}
export default renderList
