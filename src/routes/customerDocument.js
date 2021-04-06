import express from 'express'
import fs from 'fs'
import { validateRequiredFields, authenticateJWT } from '../util'
import { getUserCustomer } from './user'
import Customer from '../model/database/customer'
import CustomerDocument from '../model/database/customerDocument'
import ErrorOutput from '../model/ErrorOutput'
import ErrorValidateFields from '../model/ErrorValidateFields'
import multer from 'multer'
import { StatusCodes } from 'http-status-codes'

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync(`public/files/${req.body.cpf}`)) {
      fs.mkdirSync(`public/files/${req.body.cpf}`)
    }
    callback(null, `public/files/${req.body.cpf}`)
  },
  filename: (req, file, callback) => {
    const extension = file.mimetype.split('/')[1]
    callback(null, `${req.body.documentName}.${extension}`)
  }
})

const upload = multer({
  storage: multerStorage,
  fileFilter: async (req, file, callback) => {
    if (req.userProfile === 'CLIENT') {
      const authenticatedCustomer = await getUserCustomer(req.userId)

      // Clients only have permission to query for their own data
      if (!req.body.cpf) {
        req.body.cpf = authenticatedCustomer.cpf
      } else if (req.body.cpf - 0 !== authenticatedCustomer.cpf) {
        return callback(new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot upload another client\'s document'), false)
      }
    }

    const missingFields = validateRequiredFields(req.body, 'cpf documentName')

    if (missingFields.length) {
      callback(new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'form data', missingFields), false)
    } else {
      try {
        const customer = await Customer.findOne({ cpf: req.body.cpf }).exec()

        if (!customer) {
          return callback(new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.'), false)
        }

        callback(null, true)
      } catch (error) {
        return callback(new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching customer.', error), false)
      }
    }
  }
}).single('document')

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const insertNewDocument = (req, res) => {
  upload(req, res, async (error) => {
    if (error instanceof ErrorOutput) {
      error.sendResponse(res)
      return
    } else if (error) {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected error.', error).sendResponse(res)
    } else if (!req.file) {
      return new ErrorOutput(StatusCodes.BAD_REQUEST, "Missing the 'document' file.", error).sendResponse(res)
    }

    try {
      let customer = await Customer
        .findOne({ cpf: req.body.cpf })
        .populate('customerDocuments')
        .exec()

      if (!customer) {
        return new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
      }

      const customerDocument = await CustomerDocument.create({
        documentName: req.body.documentName,
        documentType: req.file.mimetype,
        document: req.file.path,
        customer: customer._id
      })

      const documentIndex = customer.customerDocuments.findIndex(doc => doc.documentName === req.body.documentName)
      if (documentIndex >= 0) {
        customer.customerDocuments.splice(documentIndex, 1, customerDocument._id)
      } else {
        customer.customerDocuments.push(customerDocument._id)
      }

      customer = await Customer
        .findByIdAndUpdate(
          customer._id,
          { customerDocuments: customer.customerDocuments },
          { new: true })
        .populate('customerDocuments', 'documentName documentType')
        .exec()

      res.status(StatusCodes.OK).json({ customer })
    } catch (error) {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error inserting new document.', error).sendResponse(res)
    }
  })
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getDocumentList = async (req, res) => {
  if (req.userProfile === 'CLIENT') {
    const authenticatedCustomer = await getUserCustomer(req.userId)

    // Clients only have permission to query for their own data
    if (!req.query.cpf) {
      req.query.cpf = authenticatedCustomer.cpf
    } else if (req.query.cpf - 0 !== authenticatedCustomer.cpf) {
      return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot fetch another client\'s document').sendResponse(res)
    }
  }

  const missingFields = validateRequiredFields(req.query, [
    { fieldName: 'cpf' }
  ])

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.BAD_REQUEST, 'params', missingFields).sendResponse(res)
  }

  try {
    const customer = await Customer
      .findOne({ cpf: req.query.cpf })
      .populate('customerDocuments', 'documentName documentType')
      .select('customerDocuments')
      .exec()

    if (customer) {
      res.status(StatusCodes.OK).json({ customerDocuments: customer.customerDocuments })
    } else {
      return new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
    }
  } catch (error) {
    return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching customer.', error).sendResponse(res)
  }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getDocument = async (req, res) => {
  let authenticatedCustomer
  if (req.userProfile === 'CLIENT') {
    authenticatedCustomer = await getUserCustomer(req.userId)

    // Clients only have permission to query for their own data
    if (!req.query.cpf) {
      req.query.cpf = authenticatedCustomer.cpf
    }
  }

  const missingFields1 = validateRequiredFields(req.query, 'cpf documentName')
  const missingFields2 = validateRequiredFields(req.query, 'documentId')

  if (!!missingFields1.length && !!missingFields2.length) {
    return new ErrorOutput(StatusCodes.BAD_REQUEST, "You should either provide 'cpf' + 'documentName' or the 'documentId' to get a document file").sendResponse(res)
  }

  if (missingFields1.length === 0) {
    if (req.userProfile === 'CLIENT') {
      if (req.query.cpf - 0 !== authenticatedCustomer.cpf) {
        return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot fetch another client\'s document').sendResponse(res)
      }
    }

    try {
      const customer = await Customer
        .findOne({ cpf: req.query.cpf })
        .populate('customerDocuments', 'document documentName')
        .select('customerDocuments')
        .exec()

      if (customer) {
        const customerDocument = customer.customerDocuments.filter(doc => doc.documentName === req.query.documentName).pop()
        if (customerDocument) {
          res.download(customerDocument.document)
        } else {
          return new ErrorOutput(StatusCodes.NOT_FOUND, 'Document not found.').sendResponse(res)
        }
      } else {
        return new ErrorOutput(StatusCodes.NOT_FOUND, 'Customer not found.').sendResponse(res)
      }
    } catch (error) {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching customer\' documents.', error).sendResponse(res)
    }
  } else {
    try {
      const customerDocument = await CustomerDocument
        .findById(req.query.documentId)
        .populate('customer')
        .exec()

      if (customerDocument) {
        if (req.userProfile === 'CLIENT') {
          if (customerDocument.customer.cpf !== authenticatedCustomer.cpf) {
            return new ErrorOutput(StatusCodes.FORBIDDEN, 'One client cannot fetch another client\'s document').sendResponse(res)
          }
        }

        res.download(customerDocument.document)
      } else {
        return new ErrorOutput(StatusCodes.NOT_FOUND, 'Document not found.').sendResponse(res)
      }
    } catch (error) {
      return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching document.', error).sendResponse(res)
    }
  }
}

const router = express.Router()

router.post('/', authenticateJWT, insertNewDocument)
router.get('/', authenticateJWT, getDocument)
router.get('/list', authenticateJWT, getDocumentList)

export default router
