// 已遗失转载出处，如果是作者请联系本人，本人将备注出处



/*
 * Vue Filters
 * @see https://cn.vuejs.org/v2/guide/filters.html
 */

/**
 * 将文字复制到剪贴板
 * @param  {String} text
 * @returns {Promise<void>}
 */
export const copyTextToClipboard = async (text) => {
  await navigator.clipboard.writeText(text)
}
/**
 * 字符串重复
 * @param {String|Number} value
 * @param {Number} count
 */
export const repeat = (value, count) => value.toString().repeat(count)

/**
 * 字符串替换
 * @param {String|Number} value
 * @param {String} string
 * @param {String} replacement
 */
export const replace = (value, string, replacement) => value.toString().replace(new RegExp(string, 'g'), replacement)

/**
 * 手机号隐私保护
 * 13866668888 -> 138****8888
 * @param {String|Number} value
 */
export const secretPhone = (value) => value.toString().replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')

/**
 * 格式化手机号
 * 13866668888 -> "138-6666-8888"
 * @param {*} value
 */
export const formatPhone = (value) => value.toString().replace(/(^\d{3}|\d{4}\B)/g, '$1-')

/**
 * 字母大小写转换
 * type: 1-首字母大写 2-首页母小写 3-全部大写 4-全部小写 5-大小写转换
 * @param {String} value
 * @param {Number} type
 */
export const changeCase = (value, type) => {
  // 大小写转换
  const toggleCase = (value) => {
    let newValue = ''
    value.split('').forEach((item) => {
      if (/^([a-z]+)/.test(item)) {
        newValue += item.toUpperCase()
      } else if (/^([A-Z]+)/.test(item)) {
        newValue += item.toLowerCase()
      } else {
        newValue += item
      }
    })
    return newValue
  }

  switch (type) {
    case 1:
      return value.charAt(0).toUpperCase() + value.slice(1)
    case 2:
      return value.charAt(0).toLowerCase() + value.slice(1)
    case 3:
      return value.toUpperCase()
    case 4:
      return value.toLowerCase()
    case 5:
      return toggleCase(value)
    default:
      return value
  }
}

/**
 * 去除空格
 * type: 1-前后空格 2-前空格 3-后空格 4-所有空格
 * @param {String} value
 * @param {Number} type
 */
export const trim = (value, type) => {
  switch (type) {
    case 1:
      return value.replace(/(^\s*)|(\s*$)/g, '')
    case 2:
      return value.replace(/(^\s*)/g, '')
    case 3:
      return value.replace(/(\s*$)/g, '')
    case 4:
      return value.replace(/\s+/g, '')
    default:
      return value
  }
}

/**
 * 日期时间格式化
 * {{ Date() | formatDate }} -> 2020-09-28 15:54:52
 * {{ '2020/10/01 12:30:45' | formatDate('yyyy-MM-dd hh:mm:ss w') }} -> 2020-10-01 12:30:45 星期四
 * @param {Date} value 可以被 new Date(value) 解析的时间格式，如 Date()、2020/10/01、2020-10-01 12:00 等
 * @param {String} fmt 格式化模版
 */
export const formatDate = (value, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  const date = new Date(value)
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'w+': date.getDay(), // 星期
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }

  for (var k in o) {
    if (k === 'w+') {
      if (o[k] === 0) {
        fmt = fmt.replace('w', '星期日')
      } else if (o[k] === 1) {
        fmt = fmt.replace('w', '星期一')
      } else if (o[k] === 2) {
        fmt = fmt.replace('w', '星期二')
      } else if (o[k] === 3) {
        fmt = fmt.replace('w', '星期三')
      } else if (o[k] === 4) {
        fmt = fmt.replace('w', '星期四')
      } else if (o[k] === 5) {
        fmt = fmt.replace('w', '星期五')
      } else if (o[k] === 6) {
        fmt = fmt.replace('w', '星期六')
      }
    } else if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length),
      )
    }
  }

  return fmt
}

/**
 * 文件大小显示转换
 * 12         -> 12.0 B
 * 98223445   -> 93.7 MB
 * 9822344566 -> 9.15 GB
 * @param {String|Number} bytes
 */
export const bytesToSize = (bytes) => {
  bytes = bytes.toString()
  if (bytes == 0) return '0 B'
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * 千分位格式化
 * 1234567 -> 1,234,567
 * @param {String|Number} value
 */
export const thousands = (value, fractionDigits = 0) => {
  const regexp = /\d{1,3}(?=(\d{3})+(\.\d*)?$)/g
  return (Number(value).toFixed(fractionDigits) + '').replace(regexp, '$&,')
}

/**
 * 现金数字转大写
 * 1234.567 -> 壹仟贰佰叁拾肆元伍角陆分柒厘
 * @param {String|Number} value
 */
export const upDigit = (value) => {
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const fraction = ['角', '分', '厘']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  let s = ''
  let head = value < 0 ? '欠' : ''
  value = Math.abs(value)

  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(value * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '')
  }

  s = s || '整'
  value = Math.floor(value)

  for (let i = 0; i < unit[0].length && value > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && value > 0; j++) {
      p = digit[value % 10] + unit[1][j] + p
      value = Math.floor(value / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }

  return (
    head +
    s
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整')
  )
}
