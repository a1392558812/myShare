export default (state,actions) =>{
  switch (actions.type) {
    case 'toggle':
      let newState = {...state}
      console.log(newState)
      if(actions.data in newState){
        delete newState[actions.date]
      }else{
        console.log(actions.data)
        newState[actions.data] = true
      }
      return newState
    case 'reset':
      return {}
    default:
      return state
  }
}