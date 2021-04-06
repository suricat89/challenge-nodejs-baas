import express from 'express'
import { validateRequiredFields, authenticateJWT } from '../util'
import Customer from '../model/database/customer'
import Account from '../model/database/account'
import { getUserAccount } from './user'
import ErrorValidateFields from '../model/ErrorValidateFields'
import { StatusCodes } from 'http-status-codes'
import ErrorOutput from '../model/ErrorOutput'

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const createAccount = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can create an account').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf agency accountNumber')
  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer
      .findOne({ cpf: req.body.cpf }, 'cpf name account')
      .populate('account')
      .exec()

    if (!customer) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    } else if (customer.account) {
      return new ErrorOutput(StatusCodes.PRECONDITION_FAILED, 'This customer already have an account.', customer).sendResponse(res)
    } else {
      const account = await Account.create({
        agency: req.body.agency,
        accountNumber: req.body.accountNumber,
        balance: 0,
        customer: customer._id
      })

      const newCustomer = await Customer
        .findByIdAndUpdate(
          customer._id,
          { account: account._id },
          { new: true }
        )
        .populate('account')
        .exec()

      res.status(StatusCodes.CREATED).json({ customer: newCustomer })
    }
  } catch (error) {
    console.info(error)
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const listAccounts = async (req, res) => {
  const limit = req.query.limit - 0 || 20
  const offset = req.query.offset - 0 || 0
  delete req.query.limit
  delete req.query.offset

  if (req.userProfile === 'CLIENT') {
    const authenticatedAccount = await getUserAccount(req.userId)

    // Clients only have permission to query for their own data
    if (!req.query.agency || !req.query.accountNumber) {
      req.query.agency = authenticatedAccount.agency
      req.query.accountNumber = authenticatedAccount.accountNumber
    } else if (req.query.agency - 0 !== authenticatedAccount.agency ||
      req.query.accountNumber - 0 !== authenticatedAccount.accountNumber) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot query data from another client\'s account').sendResponse(res)
    }
  }

  try {
    const accounts = await Account
      .find(req.query, '-transactions')
      .populate('customer', 'cpf name address')
      .limit(limit)
      .skip(offset)
      .exec()

    res.status(StatusCodes.OK).json({ accounts })
  } catch (error) {
    console.info(error)
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getAccountData = async (req, res) => {
  if (req.userProfile === 'CLIENT') {
    const authenticatedAccount = await getUserAccount(req.userId)

    // Clients only have permission to query for their own data
    if (!req.query.agency || !req.query.accountNumber) {
      req.query.agency = authenticatedAccount.agency
      req.query.accountNumber = authenticatedAccount.accountNumber
    } else if (req.query.agency - 0 !== authenticatedAccount.agency ||
      req.query.accountNumber - 0 !== authenticatedAccount.accountNumber) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot query data from another client\'s account').sendResponse(res)
    }
  }

  const missingFields = validateRequiredFields(req.query, 'agency accountNumber')

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'params', missingFields).sendResponse(res)
  }

  let startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  startDate.setHours(0)
  startDate.setMinutes(0)
  startDate.setSeconds(0)
  startDate.setMilliseconds(0)
  let endDate = new Date()
  endDate.setHours(23)
  endDate.setMinutes(59)
  endDate.setSeconds(59)
  endDate.setMilliseconds(999)
  if (req.query.startDate) {
    startDate = new Date(req.query.startDate)
    if (!startDate.getTime()) {
      return new ErrorOutput(StatusCodes.BAD_REQUEST, 'Invalid startDate.').sendResponse(res)
    }
    delete req.query.startDate
  }
  if (req.query.endDate) {
    endDate = new Date(req.query.endDate)
    if (!endDate.getTime()) {
      return new ErrorOutput(StatusCodes.BAD_REQUEST, 'Invalid endDate.').sendResponse(res)
    }
    delete req.query.endDate
  }

  try {
    const account = await Account
      .findOne(req.query)
      .populate('customer', 'cpf name rg')
      .populate({
        path: 'transactions.transaction',
        match: {
          dateTime: {
            $gte: startDate,
            $lte: endDate
          }
        },
        populate: {
          path: 'originAccount',
          select: 'agency accountNumber customer',
          populate: {
            path: 'customer',
            select: 'rg cpf name'
          }
        }
      })
      .populate({
        path: 'transactions.transaction',
        match: {
          dateTime: {
            $gte: startDate,
            $lte: endDate
          }
        },
        populate: {
          path: 'destinationAccount',
          select: 'agency accountNumber customer',
          populate: {
            path: 'customer',
            select: 'rg cpf name'
          }
        }
      })
      .exec()

    if (!account) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Account not found.').sendResponse(res)
    }

    if (account && account.transactions.length) {
      account.transactions = account.transactions.filter(t => t.transaction !== null)
      account.transactions = account.transactions
        .sort((a, b) => a.transaction.dateTime.getTime() - b.transaction.dateTime.getTime())
    }

    res.status(StatusCodes.OK).json({ account })
  } catch (error) {
    console.info(error)
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

const router = express.Router()

router.post('/', authenticateJWT, createAccount)
router.get('/list', authenticateJWT, listAccounts)
router.get('/', authenticateJWT, getAccountData)

export default router
