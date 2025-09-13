import jwt from 'jsonwebtoken'

export default async function auth(req, res, next){
  const header = req.headers['authorization']
  if(!header) return res.status(401).json({ msg: 'Missing Authorization header' })
  const parts = header.split(' ')
  if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ msg: 'Invalid Authorization header' })
  const token = parts[1]
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, email: payload.email }
    next()
  }catch(err){
    return res.status(401).json({ msg: 'Invalid token' })
  }
}
