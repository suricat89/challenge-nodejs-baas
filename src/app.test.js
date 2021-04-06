'use strict'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import dotenvMock from './__mocks__/dotenv-safe'
import app from './app'

beforeAll(() => {
  dotenvMock.config()
})

describe('Healthcheck', () => {
  test('Ping', (done) => {
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
