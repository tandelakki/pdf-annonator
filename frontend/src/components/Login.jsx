import React, { useState } from 'react'
import API, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await API.post('/auth/login', { email, password })
      const token = res.data.access_token
      localStorage.setItem('token', token)
      setAuthToken(token)
      navigate('/dashboard')
    }catch(err){
      console.error(err)
      alert(err.response?.data?.msg || 'Login failed')
    }
  }

  return (
    
   
     <form className="card" onSubmit={submit}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
       <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  )
}
