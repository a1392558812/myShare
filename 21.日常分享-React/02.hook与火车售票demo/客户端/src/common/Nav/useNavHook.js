import { useCallback, useMemo } from 'react'
import { formatFun } from '../../index/DepartureDate/handelData'


const useNavHook = (departTime,nextHandelDispatch,prevHandelDispatch) =>{
  const isPrevDisabled = useMemo(() =>{
    return formatFun(departTime) <= formatFun()
  },[departTime])
  const isNextDisabled = useMemo((() =>{
    return (formatFun(departTime) - formatFun()) > 20*86400*1000
  }),[departTime])
  const nextHandel = useCallback(() =>{
    if(!isNextDisabled){
      nextHandelDispatch()
    }
  },[isNextDisabled,departTime])
  const prevHandel = useCallback(() =>{
    if(!isPrevDisabled){
      prevHandelDispatch()
    }
  },[isPrevDisabled,departTime])
  return {
    isPrevDisabled,
    isNextDisabled,
    nextHandel,
    prevHandel
  }
}

export default useNavHook