import mongoose from 'mongoose'

const Types = mongoose.Schema.Types

export default mongoose.model('Transaction', new mongoose.Schema({
  transactionType: { type: String, enum: ['WITHDRAW', 'DEPOSIT', 'DEBIT', 'P2P'], required: true },
  originAccount: { type: Types.ObjectId, ref: 'Account' },
  destinationAccount: { type: Types.ObjectId, ref: 'Account' },
  dateTime: { type: Date, required: true, default: Date.now() },
  value: { type: Number, required: true }
}))
