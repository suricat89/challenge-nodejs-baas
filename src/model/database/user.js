import mongoose from 'mongoose'

const Types = mongoose.Types

export default mongoose.model('User', new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  customer: { type: Types.ObjectId, ref: 'Customer' },
  profile: {
    type: String,
    required: true,
    enum: ['CLIENT', 'MANAGER'],
    default: 'CLIENT'
  }
}))
