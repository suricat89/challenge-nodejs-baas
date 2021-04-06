import mongoose from 'mongoose'

const Types = mongoose.Types

export default mongoose.model('CustomerDocument', new mongoose.Schema({
  documentName: { type: String, required: true },
  documentType: { type: String, required: true },
  document: { type: String, required: true },
  customer: { type: Types.ObjectId, ref: 'Customer' }
}))
