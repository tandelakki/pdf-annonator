import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ msg: 'email and password required' })
  try{
    const existing = await User.findOne({ email })
    if(existing) return res.status(400).json({ msg: 'email already in use' })
    const hash = await bcrypt.hash(password, 10)
    const user = new User({ email, passwordHash: hash })
    await user.save()
    return res.json({ msg: 'registered' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ msg: 'email and password required' })
  try{
    const user = await User.findOne({ email })
    if(!user) return res.status(401).json({ msg: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok) return res.status(401).json({ msg: 'invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ access_token: token })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// GET /api/auth/verify (optional)
router.get('/verify', async (req, res) => {
  const header = req.headers['authorization']
  if(!header) return res.status(401).json({ msg: 'Missing Authorization header' })
  const parts = header.split(' ')
  if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ msg: 'Invalid Authorization header' })
  const token = parts[1]
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({ id: payload.id, email: payload.email })
  }catch(err){
    return res.status(401).json({ msg: 'Invalid token' })
  }
})
   
export default router
