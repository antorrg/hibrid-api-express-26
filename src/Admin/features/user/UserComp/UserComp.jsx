import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import User from './User'
//import './userComponent.css'
import {getUsers, getUserById, cleanState}from '../../Redux/actions'

const UserComp = () => {
  const dispatch = useDispatch()
  const {id}= useParams()
  const users = useSelector((state)=> state.Users)
  const singleUser = useSelector((state)=> state.UserById)
  const [single, setSingle]= useState(false)

  useEffect(()=>{
    if(id){
      setSingle(true)
      dispatch(getUserById(id))
    }else{
      setSingle(false)
    dispatch(getUsers())
    }
    return ()=>{
      dispatch(cleanState())}
  },[id])

  return (
    <>
    {!id ?
     <div className='container-fluid'>
     <div className='row'> 
       {/* <div className='contain-user'> */}
        {users?.map((user)=>
        <div key={user.id} className="col-12 col-md-6 col-lg-4 col-xl-3 my-1 me-1 mb-2">
        <User user={user} isSingleUser={single} />
        </div>
        )}
      </div>
      </div>
      
    :
    <>
    <div className="imageBack">
      <div className="coverBack">
        <div className="container-md modal-content colorBack formProductContainer rounded-4 shadow ">
          <User  key={singleUser.id} user={singleUser} isSingleUser={single}/>
        </div>
      </div>
      </div></>
      }
    </>
  )
}

export default UserComp
