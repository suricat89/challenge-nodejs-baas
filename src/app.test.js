'use strict'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import dotenvMock from './__mocks__/dotenv-safe'
import app from './app'

beforeAll(() => {
  dotenvMock.config()
})

describe('Healthcheck', () => {
  it('should ping', (done) => {
    request(app)
      .get('/healthcheck/ping')
      .expect(StatusCodes.OK, {
        ping: 'pong'
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('API Doc', () => {
  it('should redirect root path to /openapi', (done) => {
    request(app)
      .get('/')
      .expect(StatusCodes.PERMANENT_REDIRECT)
      .end((err, res) => {
        if (err) return done(err)
        if (res.headers.location === '/openapi') done()
        else done('Redirect did not happen as expected')
      })
  })
})
