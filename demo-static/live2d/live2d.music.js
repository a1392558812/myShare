/** 获取歌单数据，一言官网提供的示例 https://developer.hitokoto.cn/sentence/demo */
// 获取歌单列表数据
export function fetch163Playlist(playlistId) {
  return new Promise((ok, err) => {
    fetch(`https://v1.hitokoto.cn/nm/playlist/${playlistId}`)
      .then((response) => response.json())
      .then((data) => {
        const arr = []
        data.playlist.tracks.map(function (value) {
          arr.push(value.id)
        })
        return arr
      })
      .then(fetch163Songs)
      .then(ok)
      .catch(err)
  })
}
// 获取歌曲数据
export function fetch163Songs(Ids) {
  return new Promise(function (ok, err) {
    let ids
    switch (typeof Ids) {
      case 'number':
        ids = [Ids]
        break
      case 'object':
        if (!Array.isArray(Ids)) {
          err(new Error('Please enter array or number'))
          return
        }
        ids = Ids
        break
      default:
        err(new Error('Please enter array or number'))
        return
        break
    }
    fetch(`https://v1.hitokoto.cn/nm/summary/${ids.join(',')}?lyric=true&common=true`)
      .then((response) => response.json())
      .then((data) => {
        const songs = []
        data.songs.map(function (song) {
          songs.push({
            name: song.name,
            url: song.url,
            artist: song.artists.join('/'),
            album: song.album.name,
            pic: song.album.picture,
            lrc: song.lyric
          })
        })
        return songs
      })
      .then(ok)
      .catch(err)
  })
}
