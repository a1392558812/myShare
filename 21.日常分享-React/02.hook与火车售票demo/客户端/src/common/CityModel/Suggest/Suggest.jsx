import React,{memo,useEffect,useCallback,useState,useMemo} from 'react'
import PropTypes from 'prop-types'
import '../cityModel.css'
import SuggestItem from '../SuggestItem/SuggestItem'
import {
  requestSearchData
} from '../../../ajax'


const Suggest = memo((props) =>{
  const [nowResult, setNowResult ] = useState([])
  const searchKey = props.inputValue
  console.log(searchKey)
  const getRequestSearchData =useCallback(async ({searchKey}) =>{
    const result = await requestSearchData({searchKey})
    console.log(result)
    if(result.code === 0){
      const {dataArr,keyWord} = result.data
      if(keyWord === searchKey){
        setNowResult(dataArr)
      }
    }else{
      console.log('请求出错了')
    }
  },[])
  useEffect(() =>{
    getRequestSearchData({searchKey})
  },[searchKey])
  const ifNullSearch = useMemo(() =>{
    return nowResult.length?nowResult:[{display:searchKey}]
  },[nowResult,searchKey])
  return (
    <div className='city-suggest'>
      <ul className='city-suggest-ul'>
        {
          ifNullSearch.map((result) =>{
            return (
              <SuggestItem key={result.display} name={result.display}/>
            )
          })
        }
      </ul>
    </div>
  )
})
Suggest.propTypes = {
  inputValue:PropTypes.string.isRequired
}

export default Suggest
