import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API = axios.create({ baseURL: API_URL })

export function setAuthToken(token){
  if(token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete API.defaults.headers.common['Authorization']
}

// load token from localStorage if present
const token = localStorage.getItem('token')
if(token) setAuthToken(token)

export default API
