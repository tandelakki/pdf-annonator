import { Router } from 'express';
const router = Router();
import multer, { diskStorage } from 'multer';
import { join, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import Pdf from '../models/Pdf.js';
import Highlight from '../models/Highlight.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')

const storage = diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4()
    cb(null, `${id}.pdf`)
  }
})
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if(file.mimetype !== 'application/pdf') return cb(new Error('Only PDFs allowed'))
  cb(null, true)
}})

// POST /api/pdfs/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  if(!req.file) return res.status(400).json({ msg: 'no file uploaded' })
  try{
    const fileUuid = basename(req.file.filename, '.pdf')
    const pdf = new Pdf({ uuid: fileUuid, originalName: req.file.originalname, filename: req.file.filename, owner: req.user.id })
    await pdf.save()
    return res.json({ file_uuid: fileUuid, original_name: req.file.originalname })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// GET /api/pdfs - list user's pdfs
router.get('/', auth, async (req, res) => {
  try{
    const list = await Pdf.find({ owner: req.user.id }).sort({ createdAt: -1 })
    return res.json(list.map(p=> ({ uuid: p.uuid, original_name: p.originalName, uploaded_at: p.createdAt })))
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// GET /api/pdfs/:uuid/file -> serve file (protected)
router.get('/:uuid/file', auth, async (req, res) => {
  try{
    const p = await Pdf.findOne({ uuid: req.params.uuid, owner: req.user.id })
    if(!p) return res.status(404).json({ msg: 'not found' })
    const filePath = join(UPLOAD_DIR, p.filename)
    return res.sendFile(filePath)
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// PUT /api/pdfs/:uuid/rename
router.put('/:uuid/rename', auth, async (req, res) => {
  const { newName } = req.body
  if(!newName) return res.status(400).json({ msg: 'newName required' })
  try{
    const p = await Pdf.findOneAndUpdate({ uuid: req.params.uuid, owner: req.user.id }, { originalName: newName }, { new: true })
    if(!p) return res.status(404).json({ msg: 'not found' })
    return res.json({ msg: 'renamed', uuid: p.uuid, original_name: p.originalName })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// DELETE /api/pdfs/:uuid -> delete pdf and associated highlights
router.delete('/:uuid', auth, async (req, res) => {
  try{
    const p = await Pdf.findOne({ uuid: req.params.uuid, owner: req.user.id })
    if(!p) return res.status(404).json({ msg: 'not found' })
    // remove file
    const filePath = join(UPLOAD_DIR, p.filename)
    if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
    await Highlight.deleteMany({ pdfUuid: p.uuid, owner: req.user.id })
    await p.deleteOne()
    return res.json({ msg: 'deleted' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

export default router;
