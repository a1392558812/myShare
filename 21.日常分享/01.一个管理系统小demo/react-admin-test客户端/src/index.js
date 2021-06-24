/* index.js */
import React from 'react'
import ReactDOM  from 'react-dom'

import App from './App'
import {readUserInfo} from './utils/cookies'
import cache from './utils/cache'

const user = readUserInfo()
if (user) {
    cache.user = user
}
ReactDOM.render(<App />,document.querySelector('#root')) // 将App组件标签渲染到index页面上