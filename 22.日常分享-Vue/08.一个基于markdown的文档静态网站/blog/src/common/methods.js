import axios from 'axios'
export const downFileByAxios = (href) => {
  axios({
    method: 'get',
    url: href,
    // 必须显式指明响应类型是一个Blob对象，这样生成二进制的数据，才能通过window.URL.createObjectURL进行创建成功
    responseType: 'blob'
  }).then((res) => {
    if (!res) {
      return
    }
    // 将lob对象转换为域名结合式的url
    const blobUrl = window.URL.createObjectURL(res.data)
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.style.display = 'none'
    link.href = blobUrl
    // 设置a标签的下载属性，设置文件名及格式，后缀名最好让后端在数据格式中返回
    link.download = '下载'
    // 自触发click事件
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  })
}
export const markdownTypeCheck = (type) => {
  return [
    'md',
    'js',
    'ts',
    'jsx',
    'html'
  ].filter(item => item === type).length
}
export const imgTypeCheck = (type) => {
  return [
    'jpg',
    'png',
    'gif',
    'jpeg'
  ].filter(item => item === type).length
}
export const htmlToJson = ($dt, ifRender = false, ifShow = false) => {
  // h3标签为文件夹名称
  const $h3 = $dt.children('h3')
  if ($h3.length === 0) {
    const $a = $dt.children('a')
    // 返回该书签的名称和网址组成的对象
    return $a.length > 0
      ? Object.freeze({
        name: $a.text(),
        href: $a.attr('href'),
        ...($a.attr('icon') ? { icon: $a.attr('icon') } : {})
      }) : null
  }
  const h3 = $h3.text()
  const arr = []
  const obj = { ifRender: false, ifShow: false }
  // 获取下一级dt标签集合
  const $dl = $dt.children('dl')
  const $dtArr = $dl.children('dt')
  for (let i = 0; i < $dtArr.length; i++) {
    // 遍历下一级dt标签
    const tmp = htmlToJson($dtArr.eq(i))
    // 将返回的对象push至子文件数组
    arr.push(tmp)
  }
  // 创建文件夹与子文件数组的键值对
  obj.name = h3
  obj.child = arr
  // 返回该对象
  return obj
}
export const renderList = (list, parentIndex = 0, url = []) => {
  return list.map((item, index) => {
    item.indexPage = parentIndex ? `${parentIndex}-${index}` : `${index}`
    item.url = url.length ? [...url, item.name] : [item.name]
    if (item.children) {
      item.ifShow = false // 是否显示
      item.ifHadRender = false // 是否已经渲染过
      renderList(item.children, item.indexPage, item.url)
    } else {
      item.itemActive = false
    }
    return item
  })
}
