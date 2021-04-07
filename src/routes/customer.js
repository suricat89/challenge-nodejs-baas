import express from 'express'
import {
  validateRequiredFields,
  getFieldListString,
  mapFieldsStringToObject,
  authenticateJWT
} from '../util'
import Customer from '../model/database/customer'
import ErrorValidateFields from '../model/ErrorValidateFields'
import { StatusCodes } from 'http-status-codes'
import ErrorOutput from '../model/ErrorOutput'
import { getUserCustomer } from './user'

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getCustomer = async (req, res) => {
  let fields = {}
  if (req.query.fields) {
    fields = mapFieldsStringToObject(req.query.fields)
    delete req.query.fields
  }

  if (fields.customerDocuments) {
    const index = fields.customerDocuments.findIndex(doc => doc === 'document')
    if (index >= 0) {
      fields.customerDocuments.splice(index, 1)
    }
  }

  if (!fields.customerDocuments || fields.customerDocuments.length === 0) {
    fields.customerDocuments = ['documentName', 'documentType']
  }
  if (!fields.account || fields.account.length === 0) {
    fields.account = ['agency', 'accountNumber', 'balance', 'overdraft']
  }

  const limit = req.query.limit - 0 || 20
  const offset = req.query.offset - 0 || 0
  delete req.query.limit
  delete req.query.offset

  if (req.userProfile === 'CLIENT') {
    const authenticatedCustomer = await getUserCustomer(req.userId)

    // Clients only have permission to query for their own data
    if (!req.query.cpf) {
      req.query.cpf = authenticatedCustomer.cpf
    } else if (req.query.cpf - 0 !== authenticatedCustomer.cpf) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot query data from another client').sendResponse(res)
    }
  }

  const missingFields = validateRequiredFields(req.query, 'cpf')

  if (missingFields.length > 0 && req.userProfile !== 'CLIENT') {
    try {
      const customers = await Customer
        .find(req.query)
        .skip(offset)
        .limit(limit)
        .populate('customerDocuments', getFieldListString(fields.customerDocuments, ' ', false))
        .populate('account', getFieldListString(fields.account, ' ', false))
        .populate('user', 'userName profile')
        .select(getFieldListString(fields.default, ' ', false))
        .exec()

      res.status(StatusCodes.OK).json({ customers })
    } catch (error) {
      new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching customer', error).sendResponse(res)
    }
  } else {
    try {
      const customer = await Customer
        .findOne({ cpf: req.query.cpf })
        .populate('customerDocuments', getFieldListString(fields.customerDocuments, ' ', false))
        .populate('account', getFieldListString(fields.account, ' ', false))
        .select(getFieldListString(fields.default, ' ', false))
        .exec()

      res.status(StatusCodes.OK).json({ customers: customer ? [customer] : [] })
    } catch (error) {
      new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching customer', error).sendResponse(res)
    }
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const insertNewCustomer = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can insert new customers').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf name')

  if (missingFields.length > 0) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer.create(req.body)
    res.status(StatusCodes.CREATED).json({ customer })
  } catch (error) {
    new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating customer.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const updateCustomer = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can update a customer\'s data').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf')

  if (missingFields.length > 0) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer
      .findOneAndUpdate(
        { cpf: req.body.cpf },
        req.body,
        { new: true, runValidators: true })
      .exec()

    if (customer) {
      res.status(StatusCodes.OK).json({ customer })
    } else {
      new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    }
  } catch (error) {
    new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating customer.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const addNewAddress = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can update a customer\'s data').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf address')

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer
      .findOneAndUpdate(
        { cpf: req.body.cpf },
        { $push: { address: req.body.address } },
        { new: true, runValidators: true })
      .exec()

    if (customer) {
      res.status(StatusCodes.CREATED).json({ customer })
    } else {
      new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    }
  } catch (error) {
    new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating customer.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const removeAddress = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can update a customer\'s data').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf address')

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer
      .findOneAndUpdate(
        { cpf: req.body.cpf },
        { $pull: { address: req.body.address } },
        { new: true, runValidators: true })
      .exec()

    if (customer) {
      res.status(StatusCodes.OK).json({ customer })
    } else {
      new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    }
  } catch (error) {
    new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating customer.', error).sendResponse(res)
  }
}

const router = express.Router()

router.get('/', authenticateJWT, getCustomer)
router.put('/', authenticateJWT, updateCustomer)
router.patch('/address', authenticateJWT, addNewAddress)
router.delete('/address', authenticateJWT, removeAddress)
router.post('/', authenticateJWT, insertNewCustomer)

export default router
