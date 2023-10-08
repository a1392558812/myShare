onmessage = function (e) {
  const arr = e.data
  // 设置定时器
  setInterval(function () {
    for (let i = 0; i < arr.length; i++) {
      arr[i].y += arr[i].speed
      if (arr[i].y >= 80) {
        arr[i].y = -3
      }
    }

    postMessage(arr)
  }, 1000 / 60)
}
