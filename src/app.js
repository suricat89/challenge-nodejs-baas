#!/usr/bin/env node

import express from 'express'
import morgan from 'morgan'

import customerRouter from './routes/customer'
import customerDocumentRouter from './routes/customerDocument'
import customerAccountRouter from './routes/customerAccount'
import transactionRouter from './routes/transaction'
import userRouter from './routes/user'
import { StatusCodes } from 'http-status-codes'

const app = express()
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(express.static('views'))

app.use('/customer', customerRouter)
app.use('/customer/document', customerDocumentRouter)
app.use('/customer/account', customerAccountRouter)
app.use('/transaction', transactionRouter)
app.use('/user', userRouter)

app.get('/healthcheck/ping', (req, res) => {
  res.json({ ping: 'pong' })
})

app.get('/', (req, res) => {
  res.redirect('/apidoc', StatusCodes.PERMANENT_REDIRECT)
})

export default app
