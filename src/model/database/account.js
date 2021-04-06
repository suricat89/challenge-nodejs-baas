import mongoose from 'mongoose'

const Types = mongoose.Schema.Types

export default mongoose.model('Account', new mongoose.Schema({
  agency: { type: Number, required: true },
  accountNumber: { type: Number, required: true },
  balance: { type: Number, required: true },
  customer: { type: Types.ObjectId, ref: 'Customer' },
  overdraft: { type: Number, required: true, default: 1000 },
  transactions: [
    {
      transaction: { type: Types.ObjectId, ref: 'Transaction' },
      balanceAfter: { type: Number, required: true }
    }
  ]
}).index(
  {
    agency: 1,
    accountNumber: 1
  },
  { unique: true }
))
