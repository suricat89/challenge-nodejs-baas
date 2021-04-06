import { getFieldListString } from '../util'
import ErrorOutput from './ErrorOutput'

export default class ErrorValidateFields extends ErrorOutput {
  /**
   *
   * @param {number} statusCode
   * @param {('body'|'params'|'form data'|'headers')} fieldPlace
   * @param {import('../util').RequiredField[] | import('../util').RequiredField} missingFields
   */
  constructor (statusCode, fieldPlace, missingFields) {
    const missingFieldsString = getFieldListString(missingFields)
    const userMessage = `Missing the following fields on request's ${fieldPlace}: ${missingFieldsString}`
    super(statusCode, userMessage)
    this.missingFields = missingFields
  }
}
