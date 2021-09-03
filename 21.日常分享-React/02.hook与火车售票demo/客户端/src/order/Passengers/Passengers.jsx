import React, { memo,useCallback,useMemo} from 'react'
import {useMappedState,useDispatch} from 'redux-react-hook'
import Passenger from './Passenger'
import './passengers.css'
import {
  createPassengersAdult,
  createPassengersChild,
  showGender,
  showFollowAdultMenu,
  showTicketTypeMenu,
} from '../../redux/asyncActions'

const Passengers =memo(() =>{
  const dispatch = useDispatch()
  const {passengers} = useMappedState(state => state).orderReducer
  const handelClickAdult = useCallback(() =>{
    createPassengersAdult(dispatch)
  },[])
  const handelClickChild = useCallback(() =>{
    createPassengersChild(dispatch)
  },[])
  const mapIdToName = useMemo(() =>{
    const res = {}
    for(let passenger of passengers){
      res[passenger.id] = passenger.name
    }
    return res
  },[passengers])
  return(
    <div className='passengers'>
      <ul>
        {
          passengers.map((passenger,index) =>{
            return (
              <Passenger
                mapIdToName={mapIdToName}
                showTicketTypeMenu={showTicketTypeMenu}
                showFollowAdultMenu={showFollowAdultMenu}
                showGender={showGender}
                {...passenger}
                key={passenger.id}/>
            )
          })
        }
      </ul>
      <section className='add'>
        <div className='adult' onClick={handelClickAdult}>
          添加成人
        </div>
        <div className='child' onClick={handelClickChild}>
          添加儿童
        </div>
      </section>
    </div>
  )
})


export default Passengers
