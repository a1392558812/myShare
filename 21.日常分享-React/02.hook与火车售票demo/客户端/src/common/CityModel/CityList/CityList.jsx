import React,{memo} from 'react'
import PropTypes from 'prop-types'
import CitySection from '../CitySection/CitySection'
import '../cityModel.css'
import AlphabeticIndex from '../AlphabeticIndex/ AlphabeticIndex'
const alphabet = Array.from(new Array(26),(ele,index) =>{
  return String.fromCharCode(65+index)
})
const CityList = memo((props) =>{
  const {sections} = props
  return (
    <div className='city-list'>
      <div className='city-cate'>
        {
          sections.map((section) =>{
            return (
              <CitySection
                title={section.title}
                cities={section.citys}
                key={section.title}/>
            )
          })
        }
      </div>
      <div className='city-index'>
        {
          alphabet.map((letter) =>{
            return (
              <AlphabeticIndex key={letter} alpha={letter}/>
            )
          })
        }
      </div>
    </div>
  )
})

CityList.propTypes = {
  sections:PropTypes.array.isRequired,
}
export default CityList