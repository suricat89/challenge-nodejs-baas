import express from 'express'
import { validateRequiredFields, authenticateJWT } from '../util'
import Customer from '../model/database/customer'
import User from '../model/database/user'
import ErrorValidateFields from '../model/ErrorValidateFields'
import { StatusCodes } from 'http-status-codes'
import ErrorOutput from '../model/ErrorOutput'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/**
 *
 * @param {String} userId
 */
export const getUserCustomer = async (userId) => {
  const user = await User
    .findById(userId)
    .populate('customer')
    .select('customer')
    .exec()

  return user.customer
}

/**
 *
 * @param {String} userId
 */
export const getUser = async (userId) => {
  const user = await User
    .findById(userId)
    .exec()

  return user
}

/**
 *
 * @param {String} userId
 */
export const getUserAccount = async (userId) => {
  const user = await User
    .findById(userId)
    .populate({
      path: 'customer',
      populate: {
        path: 'account'
      }
    })
    .exec()

  return user.customer.account
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const validateAdminUser = async (req, res) => {
  let user = await User.findOne({ userName: 'admin' }).exec()

  if (!user) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_USER_PASSWORD, 10)

    user = await User.create({
      userName: 'admin',
      password: passwordHash,
      profile: 'MANAGER'
    })
  }

  res.status(StatusCodes.OK).json({ user })
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const createNewUser = async (req, res) => {
  if (req.userProfile !== 'MANAGER') {
    return new ErrorOutput(StatusCodes.FORBIDDEN, 'Only a manager can create new users').sendResponse(res)
  }

  const missingFields = validateRequiredFields(req.body, 'cpf userName password')

  if (missingFields.length > 0) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    let customer = await Customer.findOne({ cpf: req.body.cpf }).exec()

    if (!customer) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    } else if (customer.user) {
      return new ErrorOutput(StatusCodes.PRECONDITION_FAILED, 'Customer already have an user.').sendResponse(res)
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10)

    const user = await User.create({
      userName: req.body.userName,
      password: passwordHash,
      profile: req.body.profile,
      customer: customer._id
    })

    customer = await Customer
      .findByIdAndUpdate(
        customer._id,
        { user },
        { new: true, runValidators: true }
      )
      .populate('user')
      .exec()

    res.status(StatusCodes.OK).json({ user: customer.user })
  } catch (error) {
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const updateUser = async (req, res) => {
  if (req.userProfile === 'CLIENT') {
    const authenticatedUser = await getUser(req.userId)

    delete req.body.profile
    // Clients only have permission to query for their own data
    if (!req.body.userName) {
      req.body.userName = authenticatedUser.userName
    } else if (req.body.userName !== authenticatedUser.userName) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot change another client\'s user').sendResponse(res)
    }
  }

  const missingFields = validateRequiredFields(req.body, 'userName')

  if (missingFields.length > 0) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    const user = await User.findOneAndUpdate(
      { userName: req.body.userName },
      req.body,
      { new: true, runValidators: true }
    )

    if (user) {
      res.status(StatusCodes.OK).json({ user })
    } else {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'User not found.').sendResponse(res)
    }
  } catch (error) {
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const loginUser = async (req, res) => {
  const missingFields = validateRequiredFields(req.body, 'userName password')

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'body', missingFields).sendResponse(res)
  }

  try {
    const user = await User.findOne({ userName: req.body.userName }).exec()

    if (!user) {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'User not found.').sendResponse(res)
    }

    const verifyPassword = await bcrypt.compare(req.body.password, user.password)
    if (!verifyPassword) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'Password did not match.').sendResponse(res)
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.userName,
        userProfile: user.profile
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRITY_TIME - 0 }
    )

    res.status(StatusCodes.OK).json({ auth: true, token })
  } catch (error) {
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const logoutUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ auth: false, token: null })
}

const router = express.Router()

router.post('/', authenticateJWT, createNewUser)
router.put('/', authenticateJWT, updateUser)
router.post('/login', loginUser)
router.post('/logout', authenticateJWT, logoutUser)
router.post('/validateAdminUser', validateAdminUser)

export default router
