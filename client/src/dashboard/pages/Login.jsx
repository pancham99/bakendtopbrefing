import React, { useState, useContext } from 'react'
import { base_url } from '../../config/config'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import tost from 'react-hot-toast'
import storeContext from '../../context/storeContext'

const Login = () => {

  const navigate = useNavigate()
  const { dispatch } = useContext(storeContext)
  const [loder, setLoder] = useState(false)
  const [state, setState] = useState({
    email: '',
    password: ''
  })

  console.log(state)

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value

    })
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoder(true)
      const { data } = await axios.post(`${base_url}/api/login`, state)
      setLoder(false)
      localStorage.setItem('newstoken', data.token)
      tost.success(data.message)
      dispatch({
        type: 'login_success',
        payload: {
          token: data.token
        }
      })
      navigate('/dashboard')
    } catch (error) {
      setLoder(false)
      tost.error(error.response.data.message)
    }
  }

  return (
    <div className='min-w-screen min-h-screen bg-slate-200 flex justify-center items-center'>
      <div className='w-[340px] text-slate-600 shadow-md'>
        <div className='bg-white h-full px-7 py-8 rounded-md'>
          <div className='w-full justify-center items-center flex'>
            <h2>News portal </h2>
            {/* <img className='w-[200px]' src='' alt='' /> */}
          </div>

          <form onSubmit={submit}>
            <div className='flex flex-col gap-y-2 mb-5'>
              <label className='text-md font-medium text-gray-600' htmlFor='email'>Email</label>
              <input onChange={inputHandle} value={state.email} required type='text' placeholder='email' name='email' className='px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10' id='email' />
            </div>

            <div className='flex flex-col gap-y-2 mb-5'>
              <label className='text-md font-medium text-gray-600' htmlFor='password'>Password</label>
              <input onChange={inputHandle} value={state.password} required name='password' id='password' type='password' placeholder='password' className='px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10' />

            </div>

            <div className='mt-2'>
              <button disabled={loder} className='px-3 py-[6px] w-full bg-purple-500 rounded-md text-white hover:bg-purple-600' to='/dashboard/writers'>{loder ? "loding.." : "Login"}</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Login