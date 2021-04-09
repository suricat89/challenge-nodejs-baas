import express from 'express'
import { validateRequiredFields, authenticateJWT } from '../util'
import { getUserAccount } from './user'
import Account from '../model/database/account'
import Transaction from '../model/database/transaction'
import ErrorValidateFields from '../model/ErrorValidateFields'
import { StatusCodes } from 'http-status-codes'
import ErrorOutput from '../model/ErrorOutput'

/**
 *
 * @param {('WITHDRAW'|'DEPOSIT'|'DEBIT')} type
 * @param {Object} transactionData
 * @param {Number} transactionData.agency
 * @param {Number} transactionData.accountNumber
 * @param {Number} transactionData.value
 * @param {String} userId
 * @param {String} userProfile
 */
const simpleTransaction = async (type, transactionData, userId, userProfile) => {
  if (userProfile === 'CLIENT') {
    const authenticatedAccount = await getUserAccount(userId)

    // Clients only have permission to query for their own data
    if (!transactionData.agency || !transactionData.accountNumber) {
      transactionData.agency = authenticatedAccount.agency
      transactionData.accountNumber = authenticatedAccount.accountNumber
    } else if (transactionData.agency - 0 !== authenticatedAccount.agency ||
      transactionData.accountNumber - 0 !== authenticatedAccount.accountNumber) {
      throw new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot make transactions using another client\'s account')
    }
  }

  const missingFields = validateRequiredFields(transactionData, 'agency accountNumber value')

  if (missingFields.length) {
    throw new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields)
  }

  let account = await Account.findOne(
    {
      agency: transactionData.agency,
      accountNumber: transactionData.accountNumber
    }
  ).exec()

  if (!account) {
    throw new ErrorOutput(StatusCodes.NOT_FOUND, 'Account not found.')
  }

  const transactionValue = transactionData.value - 0
  const transactionObject = {
    transactionType: type,
    value: transactionValue
  }

  let newBalance = account.balance
  if (type === 'DEPOSIT') {
    newBalance += transactionValue
    transactionObject.destinationAccount = account._id
  } else {
    if (account.balance - transactionValue < 0 - account.overdraft) {
      throw new ErrorOutput(StatusCodes.PRECONDITION_FAILED, 'Not enough funds.')
    }
    newBalance -= transactionValue
    transactionObject.originAccount = account._id
  }

  let transaction = await Transaction.create(transactionObject)

  account = await Account.findByIdAndUpdate(account._id, {
    balance: newBalance,
    $push: {
      transactions: {
        transaction: transaction._id,
        balanceAfter: newBalance
      }
    }
  }, { new: true, runValidators: true }).exec()

  transaction = await Transaction
    .findById(transaction._id)
    .populate({
      path: 'originAccount',
      select: '-transactions',
      populate: {
        path: 'customer',
        select: 'rg cpf name'
      }
    })
    .populate({
      path: 'destinationAccount',
      select: '-transactions',
      populate: {
        path: 'customer',
        select: 'rg cpf name'
      }
    })
    .exec()

  return transaction
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const newWithdraw = async (req, res) => {
  try {
    const transaction = await simpleTransaction('WITHDRAW', req.body, req.userId, req.userProfile)
    res.status(StatusCodes.OK).json({ transaction })
  } catch (error) {
    if (error instanceof ErrorOutput) {
      error.sendResponse(res)
    } else {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
    }
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const newDeposit = async (req, res) => {
  try {
    const transaction = await simpleTransaction('DEPOSIT', req.body, req.userId, req.userProfile)
    res.status(StatusCodes.OK).json({ transaction })
  } catch (error) {
    if (error instanceof ErrorOutput) {
      error.sendResponse(res)
    } else {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
    }
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const newDebit = async (req, res) => {
  try {
    const transaction = await simpleTransaction('DEBIT', req.body, req.userId, req.userProfile)
    res.status(StatusCodes.OK).json({ transaction })
  } catch (error) {
    if (error instanceof ErrorOutput) {
      error.sendResponse(res)
    } else {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
    }
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const newP2P = async (req, res) => {
  if (req.userProfile === 'CLIENT') {
    const authenticatedAccount = await getUserAccount(req.userId)

    // Clients only have permission to query for their own data
    if (!req.body.originAccount || !req.body.originAccount.agency || !req.body.originAccount.accountNumber) {
      req.body.originAccount = {
        agency: authenticatedAccount.agency,
        accountNumber: authenticatedAccount.accountNumber
      }
    } else if (req.body.originAccount.agency - 0 !== authenticatedAccount.agency ||
      req.body.originAccount.accountNumber - 0 !== authenticatedAccount.accountNumber) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot make transactions using another client\'s account').sendResponse(res)
    }
  }

  const missingFields = validateRequiredFields(req.body, [
    'originAccount.agency',
    'originAccount.accountNumber',
    'destinationAccount.agency',
    'destinationAccount.accountNumber',
    'value'
  ])

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  if (req.body.originAccount.agency === req.body.destinationAccount.agency &&
    req.body.originAccount.accountNumber === req.body.destinationAccount.accountNumber) {
    return new ErrorOutput(StatusCodes.PRECONDITION_FAILED, 'Origin account and destination account are the same.').sendResponse(res)
  }

  try {
    let originAccount = await Account.findOne({
      agency: req.body.originAccount.agency,
      accountNumber: req.body.originAccount.accountNumber
    }).exec()

    if (!originAccount) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Origin account not found.').sendResponse(res)
    }

    let destinationAccount = await Account.findOne({
      agency: req.body.destinationAccount.agency,
      accountNumber: req.body.destinationAccount.accountNumber
    }).exec()

    if (!destinationAccount) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Destination account not found.').sendResponse(res)
    }

    const transactionValue = req.body.value - 0
    let transaction = await Transaction.create({
      transactionType: 'P2P',
      originAccount: originAccount._id,
      destinationAccount: destinationAccount._id,
      value: transactionValue
    })

    const newOriginAccountBalance = originAccount.balance - transactionValue
    originAccount = await Account.findByIdAndUpdate(originAccount._id, {
      balance: newOriginAccountBalance,
      $push: {
        transactions: {
          transaction: transaction._id,
          balanceAfter: newOriginAccountBalance
        }
      }
    }, { new: true, runValidators: true }).exec()

    const newDestinationAccountBalance = destinationAccount.balance + transactionValue
    destinationAccount = await Account.findByIdAndUpdate(destinationAccount._id, {
      balance: newDestinationAccountBalance,
      $push: {
        transactions: {
          transaction: transaction._id,
          balanceAfter: newDestinationAccountBalance
        }
      }
    }, { new: true, runValidators: true }).exec()

    transaction = await Transaction
      .findById(transaction._id)
      .populate({
        path: 'originAccount',
        select: '-transactions',
        populate: {
          path: 'customer',
          select: 'rg cpf name'
        }
      })
      .populate({
        path: 'destinationAccount',
        select: '-transactions',
        populate: {
          path: 'customer',
          select: 'rg cpf name'
        }
      })
      .exec()

    res.status(StatusCodes.OK).json({ transaction })
  } catch (error) {
    console.info(error)
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

const router = express.Router()

router.post('/withdraw', authenticateJWT, newWithdraw)
router.post('/deposit', authenticateJWT, newDeposit)
router.post('/debit', authenticateJWT, newDebit)
router.post('/p2p', authenticateJWT, newP2P)

export default router
