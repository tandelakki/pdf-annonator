import { Schema, model } from 'mongoose'

const HighlightSchema = new Schema({
  uuid: { type: String, required: true, unique: true, index: true },
  pdfUuid: { type: String, required: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  page: { type: Number, required: true },
  text: { type: String },
  bbox: { type: Object, required: true }, // { x,y,width,height } as percentages
  color: { type: String, default: '#fffa00' },
  createdAt: { type: Date, default: Date.now }
})

export default model('Highlight', HighlightSchema)
