'use strict'
import mongoose from 'mongoose'

const Types = mongoose.Schema.Types

export default mongoose.model('Customer', new mongoose.Schema({
  name: { type: String, required: true },
  cpf: { type: Number, required: true, unique: true, index: true },
  rg: { type: String },
  account: { type: Types.ObjectId, ref: 'Account' },
  user: { type: Types.ObjectId, ref: 'User' },
  customerDocuments: [
    { type: Types.ObjectId, ref: 'CustomerDocument' }
  ],
  address: [
    {
      type: { type: String, required: true, enum: ['HOME', 'BUSINESS', 'BILLING', 'OTHER'] },
      streetName: { type: String, required: true },
      streetNumber: { type: Number },
      district: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true }
    }
  ]
}))
