import { StatusCodes } from 'http-status-codes'
import ErrorValidateFields from './model/ErrorValidateFields'
import jwt from 'jsonwebtoken'
import ErrorOutput from './model/ErrorOutput'

/**
 * @typedef RequiredField
 * @property {string} fieldName
 * @property {('GREATER'|'GREATER_OR_EQUAL'|'LESSER'|'LESSER_OR_EQUAL'|'EQUAL'|'NOT_EQUAL'|'EXISTS')} validateMethod
 * @property {number | string} validateValue
 */
/**
 *
 * @param {Object} object
 * @param {RequiredField[] | string[] | string} requiredFields
 * @returns {RequiredField[]}
 */
export const validateRequiredFields = (object, requiredFields) => {
  /** @type {RequiredField[]} */
  const requiredFieldsFinal = []

  if (typeof requiredFields === 'string') {
    requiredFieldsFinal.push(
      ...requiredFields
        .split(/[,| |;]/)
        .filter(stringField => !!stringField)
        .map(stringField => ({ fieldName: stringField.trim() }))
    )
  } else if (requiredFields instanceof Array) {
    requiredFieldsFinal.push(
      ...requiredFields.map(field => (
        typeof field === 'string'
          ? ({ fieldName: field.trim() })
          : (field)
      ))
    )
  } else {
    requiredFieldsFinal.push(
      typeof requiredFields === 'string'
        ? ({ fieldName: requiredFields.trim() })
        : (requiredFields)
    )
  }

  return requiredFieldsFinal.filter(field => {
    if (!field.validateMethod) {
      field.validateMethod = 'EXISTS'
    }

    const fieldSplit = field.fieldName.split('.')
    if (fieldSplit.length > 1) {
      const objectPart = object[fieldSplit[0]]
      const nextField = {
        ...field,
        fieldName: field.fieldName.substring(fieldSplit[0].length + 1)
      }
      if (objectPart) {
        if (typeof objectPart === 'object') {
          return validateRequiredFields(objectPart, nextField)[0]
        } else return true
      } else return true
    } else {
      switch (field.validateMethod.toUpperCase()) {
        case 'GREATER':
          return !(object[field.fieldName] > field.validateValue)
        case 'GREATER_OR_EQUAL':
          return !(object[field.fieldName] >= field.validateValue)
        case 'LESSER':
          return !(object[field.fieldName] < field.validateValue)
        case 'LESSER_OR_EQUAL':
          return !(object[field.fieldName] <= field.validateValue)
        case 'EQUAL':
          return !(object[field.fieldName] === field.validateValue)
        case 'NOT_EQUAL':
          return (object[field.fieldName] === field.validateValue)
        case 'EXISTS':
        default:
          return !(field.fieldName in object)
      }
    }
  })
}

/**
 *
 * @param {RequiredField[] | RequiredField | string[] | string} fields
 * @param {string} [separator=, ]
 * @param {boolean} [useQuotes=true]
 */
export const getFieldListString = (fields, separator = ', ', useQuotes = true) => {
  if (fields instanceof Array) {
    if (fields.length > 1) {
      /** @type {string[]} */
      const stringFields = fields.map(field => `${useQuotes ? "'" : ''}${field.fieldName || field}${useQuotes ? "'" : ''}`)
      return stringFields.join(separator)
    } else if (fields.length === 1) {
      return `${useQuotes ? "'" : ''}${fields[0].fieldName || fields[0]}${useQuotes ? "'" : ''}`
    } else {
      return ''
    }
  } else if (fields) {
    return `${useQuotes ? "'" : ''}${fields.fieldName || fields}${useQuotes ? "'" : ''}`
  } else return ''
}

/**
 *
 * @param {string} fieldsString
 */
export const mapFieldsStringToObject = (fieldsString) => {
  let fields = fieldsString.split(/[,| |;]/)
  fields = fields
    .map(field => field.trim())
    .filter(field => !!field)

  const result = { default: [] }

  fields.forEach(field => {
    const fieldSplit = field.split('.')
    if (fieldSplit.length > 1) {
      if (!result[fieldSplit[0]]) {
        result[fieldSplit[0]] = []
      }
      result[fieldSplit[0]].push(fieldSplit[1])
    } else {
      result.default.push(field)
    }
  })

  return result
}

/**
 *
 * @param {Object} object
 * @param {String[]} fields
 */
export const filterObjectFields = (object, fields) => {
  if (fields.length) {
    const result = {}
    fields.forEach(field => { result[field] = object[field] })
    return result
  } else return object
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticateJWT = (req, res, next) => {
  const missingFields = validateRequiredFields(req.headers, 'x-access-token')

  if (missingFields.length) {
    return new ErrorValidateFields(StatusCodes.UNAUTHORIZED, 'headers', missingFields).sendResponse(res)
  }

  jwt.verify(
    req.headers['x-access-token'],
    process.env.JWT_SECRET,
    (error, decoded) => {
      if (error) {
        return new ErrorOutput(StatusCodes.INTERNAL_SERVER_ERROR, 'Authentication error.', error).sendResponse(res)
      }

      req.userId = decoded.userId
      req.userName = decoded.userName
      req.userProfile = decoded.userProfile
      next()
    }
  )
}
