import React,{ Component } from 'react'
import HookChild from './HookStudy/HookStudy'

export default class HookStudy extends Component {
  state = {
    count:0
  }
  render() {
    return(
      <div>
        <HookChild count={100}/>
      </div>
    )
  }
}