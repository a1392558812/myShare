import React,{memo} from 'react'
import PropTypes from 'prop-types'
import CityItem from '../CityItem/CityItem'
import '../cityModel.css'

const CitySection = memo((props) =>{
  const {title,cities = []} = props
  return (
    <div>
      <ul className='city-ul'>
        <li className='city-li' key='title' style={{backgroundColor:'#eee'}} data-cate={title}>
          {title}--🍔
        </li>
        {
          cities.map((city,index) =>{
            return (
              <CityItem
                key={city.name}
                name={city.name}/>
            )
          })
        }
      </ul>
    </div>
  )
})

CitySection.propTypes = {
  title:PropTypes.string.isRequired,
  cities:PropTypes.array,
}
export default CitySection