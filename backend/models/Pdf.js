import { Schema, model } from 'mongoose'

const PdfSchema = new Schema({
  uuid: { type: String, required: true, unique: true, index: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
})

export default model('Pdf', PdfSchema)
