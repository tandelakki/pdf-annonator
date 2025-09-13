import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      await API.post('/auth/register', { email, password })
      alert('Registered — please login')
      navigate('/login')
    }catch(err){
      console.error(err)
      alert(err.response?.data?.msg || 'Registration failed')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Register</h2>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  )
}
