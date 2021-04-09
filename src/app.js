#!/usr/bin/env node

import express from 'express'
import morgan from 'morgan'

import customerRouter from './routes/customer'
import customerDocumentRouter from './routes/customerDocument'
import customerAccountRouter from './routes/customerAccount'
import transactionRouter from './routes/transaction'
import userRouter from './routes/user'

import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import { StatusCodes } from 'http-status-codes'

const swaggerDocument = yaml.load('openApiDocumentation.yml')
const app = express()
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(express.static('views'))
app.use(
  '/swaggerdoc',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Challenge NodeJS Documentation'
  })
)

app.use('/customer', customerRouter)
app.use('/customer/document', customerDocumentRouter)
app.use('/customer/account', customerAccountRouter)
app.use('/transaction', transactionRouter)
app.use('/user', userRouter)

app.get('/healthcheck/ping', (req, res) => {
  res.json({ ping: 'pong' })
})

app.get('/', (req, res) => {
  res.redirect('/swaggerdoc', StatusCodes.PERMANENT_REDIRECT)
})

export default app
