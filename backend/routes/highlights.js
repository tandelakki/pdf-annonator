import { Router } from 'express';
const router = Router();
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import Highlight from '../models/Highlight.js';

// GET /api/highlights/:pdfUuid
router.get('/:pdfUuid', auth, async (req, res) => {
  try{
    const list = await Highlight.find({ pdfUuid: req.params.pdfUuid, owner: req.user.id }).sort({ createdAt: 1 })
    return res.json(list.map(h=> ({ uuid: h.uuid, page: h.page, text: h.text, bbox: h.bbox, color: h.color, created_at: h.createdAt })))
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// POST /api/highlights/:pdfUuid
router.post('/:pdfUuid', auth, async (req, res) => {
  try{ 
    const { page, text, bbox, color } = req.body
    if(typeof page !== 'number' || !bbox) return res.status(400).json({ msg: 'page (number) and bbox required' })
    const h = new Highlight({ uuid: uuidv4(), pdfUuid: req.params.pdfUuid, owner: req.user.id, page, text, bbox, color })
    await h.save()
    return res.json({ uuid: h.uuid })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// PUT /api/highlights/:pdfUuid/:highlightUuid
router.put('/:pdfUuid/:highlightUuid', auth, async (req, res) => {
  try{
    const { text, bbox, color } = req.body
    const h = await Highlight.findOne({ uuid: req.params.highlightUuid, pdfUuid: req.params.pdfUuid, owner: req.user.id })
    if(!h) return res.status(404).json({ msg: 'not found' })
    if(text !== undefined) h.text = text
    if(bbox !== undefined) h.bbox = bbox
    if(color !== undefined) h.color = color
    await h.save()
    return res.json({ msg: 'updated' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

// DELETE /api/highlights/:pdfUuid/:highlightUuid
router.delete('/:pdfUuid/:highlightUuid', auth, async (req, res) => {
  try{
    const h = await Highlight.findOne({ uuid: req.params.highlightUuid, pdfUuid: req.params.pdfUuid, owner: req.user.id })
    if(!h) return res.status(404).json({ msg: 'not found' })
    await h.deleteOne()
    return res.json({ msg: 'deleted' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ msg: 'server error' })
  }
})

export default router;
