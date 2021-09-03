import React, {useState,useEffect} from 'react'


const useWindowResize = () =>{
  const [width,setWidth] = useState(document.documentElement.clientWidth)
  const [height,setHeight] = useState(document.documentElement.clientHeight)
  const handelResize = () =>{
    setWidth(document.documentElement.clientWidth)
    setHeight(document.documentElement.clientHeight)
  }
  useEffect(() =>{
    window.addEventListener('resize',handelResize,false)
    return () =>{
      window.removeEventListener('resize',handelResize,false)
    }
  },[])
  return {width,height}
}
export default useWindowResize