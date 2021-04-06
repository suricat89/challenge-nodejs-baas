export default class ErrorOutput extends Error {
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {Object} details
   */
  constructor (statusCode, message, details = {}) {
    super(message)
    this.userMessage = message
    this.statusCode = statusCode
    this.details = details
  }

  /**
   *
   * @param {import('express').Response} res
   */
  sendResponse (res) {
    const error = {}
    if (this.userMessage) {
      error.message = this.userMessage
    }
    if (this.details && Object.keys(this.details).length > 0) {
      error.details = this.details
    }

    res.status(this.statusCode).json({ error })
  }
}
