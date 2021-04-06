import request from 'supertest'
import app from '../app'
import User from '../model/database/user'
import Customer from '../model/database/customer'
import { StatusCodes } from 'http-status-codes'
import * as authMock from '../__mocks__/authentication'
import dotenvMock from '../__mocks__/dotenv-safe'
import jwt from 'jsonwebtoken'

beforeAll(() => {
  dotenvMock.config()
})

describe('JWT Login', () => {
  beforeAll(() => {
    jest.spyOn(User, 'findOne')
      .mockImplementation((user) => {
        if (user.userName === authMock.manager.userName) {
          return {
            exec: () => Promise.resolve({
              _id: 1,
              userName: authMock.manager.userName,
              password: authMock.manager.passwordHash,
              profile: authMock.manager.profile
            })
          }
        } else if (user.userName === authMock.client.userName) {
          return {
            exec: () => Promise.resolve({
              _id: 1,
              userName: authMock.client.userName,
              password: authMock.client.passwordHash,
              profile: authMock.client.profile
            })
          }
        } else if (user.userName === 'USER_NOT_FOUND') {
          return {
            exec: () => Promise.resolve(null)
          }
        }
      })
  })

  it('should login successfully', (done) => {
    request(app)
      .post('/user/login')
      .send({
        userName: authMock.manager.userName,
        password: authMock.manager.password
      })
      .expect((res) => {
        res.body.token = 'fixed token'
      })
      .expect(StatusCodes.OK, {
        auth: true,
        token: 'fixed token'
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if no userName or password provided', (done) => {
    request(app)
      .post('/user/login')
      .send({ userName: authMock.manager.userName })
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if user don\'t exist', (done) => {
    request(app)
      .post('/user/login')
      .send({
        userName: 'USER_NOT_FOUND',
        password: '1234'
      })
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the user\'s password is wrong', (done) => {
    request(app)
      .post('/user/login')
      .send({
        userName: authMock.manager.userName,
        password: 'wrong_password'
      })
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if JWT auth fails', (done) => {
    const oldSecret = process.env.JWT_SECRET
    delete process.env.JWT_SECRET

    request(app)
      .post('/user/login')
      .send({
        userName: authMock.manager.userName,
        password: authMock.manager.password
      })
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        process.env.JWT_SECRET = oldSecret
        if (err) return done(err)
        done()
      })
  })
})

describe('Logout and JWT authentication errors', () => {
  it('should logout and invalidate the JWT token', (done) => {
    request(app)
      .post('/user/logout')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        auth: false,
        token: null
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if token header is sent', (done) => {
    request(app)
      .post('/user/logout')
      .expect(StatusCodes.UNAUTHORIZED)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs in jwt validation', (done) => {
    jest.spyOn(jwt, 'verify')
      .mockImplementationOnce((token, secret, callback) => {
        callback(new Error('test error'))
      })

    request(app)
      .post('/user/logout')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Validate admin user', () => {
  it('should create the admin user if it doesn\'t exists', (done) => {
    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(null)
      }))

    jest.spyOn(User, 'create')
      .mockImplementationOnce(() => Promise.resolve({
        userName: 'admin',
        password: 'passwordHash',
        profile: 'MANAGER'
      }))

    request(app)
      .post('/user/validateAdminUser')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        user: {
          userName: 'admin',
          password: 'passwordHash',
          profile: 'MANAGER'
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should skip user creation if it already exists', (done) => {
    jest.spyOn(User, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({
          userName: 'adminThatExists',
          password: 'passwordHash',
          profile: 'MANAGER'
        })
      }))

    request(app)
      .post('/user/validateAdminUser')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        user: {
          userName: 'adminThatExists',
          password: 'passwordHash',
          profile: 'MANAGER'
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Create new user', () => {
  it('should allow a Manager to create a new user', (done) => {
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({
          _id: 1,
          cpf: 68003740088
        })
      }))

    jest.spyOn(User, 'create')
      .mockImplementationOnce(() => Promise.resolve({
        _id: 2
      }))

    jest.spyOn(Customer, 'findByIdAndUpdate')
      .mockImplementationOnce(() => ({
        populate: () => ({
          exec: () => Promise.resolve({
            user: {
              _id: 2
            }
          })
        })
      }))

    request(app)
      .post('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.OK, {
        user: {
          _id: 2
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case anyone that\'s not a Manager tries to create an user', (done) => {
    request(app)
      .post('/user')
      .set('x-access-token', authMock.client.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should handle incomplete requests', (done) => {
    request(app)
      .post('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user'
      })
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if Customer doesn\'t exists', (done) => {
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(null)
      }))

    request(app)
      .post('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if customer already have an user', (done) => {
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({
          _id: 1,
          cpf: 68003740088,
          user: {
            userName: 'userThatExists'
          }
        })
      }))

    request(app)
      .post('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.PRECONDITION_FAILED)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({
          _id: 1,
          cpf: 68003740088
        })
      }))

    jest.spyOn(User, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Update user', () => {
  it('should update successfully', (done) => {
    jest.spyOn(User, 'findOneAndUpdate')
      .mockImplementationOnce(() => Promise.resolve({
        userName: 'user_updated'
      }))

    request(app)
      .put('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.OK, {
        user: {
          userName: 'user_updated'
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow one Client to update another client\'s user', (done) => {
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({ userName: 'another_user' })
      }))

    request(app)
      .put('/user')
      .set('x-access-token', authMock.client.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow one Client to promote himself to Manager', (done) => {
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({ userName: 'test_user' })
      }))

    jest.spyOn(User, 'findOneAndUpdate')
      .mockImplementationOnce(() => Promise.resolve({
        userName: 'user_updated',
        profile: 'CLIENT'
      }))

    request(app)
      .put('/user')
      .set('x-access-token', authMock.client.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678',
        profile: 'MANAGER'
      })
      .expect(StatusCodes.OK, {
        user: {
          userName: 'user_updated',
          profile: 'CLIENT'
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should fill userName automatically if a Client didn\'t fill it mannually', (done) => {
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({ userName: 'test_user' })
      }))

    jest.spyOn(User, 'findOneAndUpdate')
      .mockImplementationOnce((filter) => Promise.resolve({
        userName: filter.userName,
        profile: 'CLIENT'
      }))

    request(app)
      .put('/user')
      .set('x-access-token', authMock.client.token)
      .send({
        cpf: 68003740088
      })
      .expect(StatusCodes.OK, {
        user: {
          userName: 'test_user',
          profile: 'CLIENT'
        }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the request is incomplete', (done) => {
    request(app)
      .put('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        password: '12345678'
      })
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the User to update', (done) => {
    jest.spyOn(User, 'findOneAndUpdate')
      .mockImplementationOnce(() => Promise.resolve(null))

    request(app)
      .put('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error any exception occurs', (done) => {
    jest.spyOn(User, 'findOneAndUpdate')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .put('/user')
      .set('x-access-token', authMock.manager.token)
      .send({
        cpf: 68003740088,
        userName: 'test_user',
        password: '12345678'
      })
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
