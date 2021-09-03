import React, {memo,useState,useMemo,useRef,useEffect,useCallback} from 'react'
import PropTypes from 'prop-types'
import useWindowResize from '../../../common/useWindowResize'

import './slider.css'
import '../bottom.css'

const Slider = memo((props) =>{
  const {
    title,
    StartTime,
    EndTime,
    StartTimeChange,
    EndTimeChange,
  } = props
  const {width,height} = useWindowResize()

  const endSliderRef = useRef()
  const startSliderRef = useRef()

  const lastStartX = useRef()
  const lastEndX = useRef()

  const sliderRef = useRef()
  const sliderWidthRef = useRef()

  /* 上一次的StartTime与EndTime */
  const prevStartState = useRef(StartTime)
  const prevEndState = useRef(EndTime)
  /* 宽度百分比 */
  const [start,setStart] = useState(StartTime/24*100)
  const [end,setEnd] = useState(EndTime/24*100)

  /* 对比先前与现在的props是否变化 */
 if(prevStartState.current !== StartTime){
    setStart(StartTime/24*100)
    prevStartState.current = StartTime
  }
  if(prevEndState.current !== EndTime){
    setEnd(EndTime/24*100)
    prevEndState.current = EndTime
  }
  /* 计算宽度百分比 */
  const calculationStart = useMemo(() =>{
    if(start>100){
      return 100
    }else if(start<0){
      return 0
    }else{
      return start
    }
  },[start])
  const calculationEnd = useMemo(() =>{
    if(end>100){
      return 100
    }else if(end<0){
      return 0
    }else{
      return end
    }
  },[end])

  const calculationStartHours = useMemo(() =>{
    return Math.round(calculationStart*24/100)
  },[calculationStart])
  const calculationEndHours = useMemo(() =>{
    return Math.round(calculationEnd*24/100)
  },[calculationEnd])

  const calculationStartHoursStr = useMemo(() =>{
    if(calculationStartHours<10){
      return '0'+calculationStartHours+':00'
    }else{
      return calculationStartHours+':00'
    }
  },[calculationStartHours])
  const calculationEndHoursStr = useMemo(() =>{
    if(calculationEndHours<10){
      return '0'+calculationEndHours+':00'
    }else{
      return calculationEndHours+':00'
    }
  },[calculationEndHours])

  const startHandelTouchStart = (e) =>{
    const touch = e.targetTouches[0]
    lastStartX.current = touch.pageX
  }
  const startHandelTouchMove = (e) => {
    const touch = e.targetTouches[0]
    let result
    if(calculationStart<=calculationEnd){
      console.log('执行了')
      const distance = touch.pageX - lastStartX.current
      lastStartX.current = touch.pageX
      result = (distance/sliderWidthRef.current)*100
    }else{
      result = -10
    }
    setStart(start =>{
      console.log(start <= end,result)
      return start+result
    })
  }

  const endHandelTouchStart = (e) =>{
    const touch = e.targetTouches[0]
    lastEndX.current = touch.pageX
  }
  const endHandelTouchMove = (e) =>{
    const touch = e.targetTouches[0]
    let result
    if(calculationStart <= calculationEnd){
      const distance = touch.pageX - lastEndX.current
      lastEndX.current = touch.pageX
      result = (distance/sliderWidthRef.current)*100
    }else{
      result = 10
    }
    setEnd(end => end+result)
  }

  useEffect(() =>{
    sliderWidthRef.current = parseFloat(
      window.getComputedStyle(sliderRef.current).width
    )
  },[width,height])
  useEffect(() =>{
    startSliderRef.current.addEventListener('touchstart',startHandelTouchStart,false)
    startSliderRef.current.addEventListener('touchmove',startHandelTouchMove,false)
    endSliderRef.current.addEventListener('touchstart',endHandelTouchStart,false)
    endSliderRef.current.addEventListener('touchmove',endHandelTouchMove,false)
    return () =>{
      startSliderRef.current.removeEventListener('touchstart',startHandelTouchStart,false)
      startSliderRef.current.removeEventListener('touchmove',startHandelTouchMove,false)
      endSliderRef.current.removeEventListener('touchstart',endHandelTouchStart,false)
      endSliderRef.current.removeEventListener('touchmove',endHandelTouchMove,false)
    }
  })

  useEffect(() =>{
    StartTimeChange(calculationStartHours)
  },[calculationStartHours])
  useEffect(() =>{
    EndTimeChange(calculationEndHours)
  },[calculationEndHours])

  return (
    <div className='option'>
      <h3>{title}</h3>
      <div className='range-slider'>
        <div className='slider' ref={sliderRef}>
          <div className='slider-range' style={{
            left: calculationStart + '%',
            width: (calculationEnd - calculationStart) + '%'
          }}/>
          <i ref={startSliderRef} className='slider-handle' style={{
            left: calculationStart + '%',
          }}>
            <span>{calculationStartHoursStr}</span>
          </i>
          <i ref={endSliderRef} className='slider-handle' style={{
            left: calculationEnd + '%',
          }}>
            <span>{calculationEndHoursStr}</span>
          </i>
        </div>
      </div>
    </div>
  )
})

Slider.propTypes = {
  title:PropTypes.string.isRequired,
  StartTime:PropTypes.number.isRequired,
  EndTime:PropTypes.number.isRequired,
  StartTimeChange:PropTypes.func.isRequired,
  EndTimeChange:PropTypes.func.isRequired,
}
export default Slider
