import request from 'supertest'
import app from '../app'
import User from '../model/database/user'
import Customer from '../model/database/customer'
import { StatusCodes } from 'http-status-codes'
import * as authMock from '../__mocks__/authentication'
import dotenvMock from '../__mocks__/dotenv-safe'

beforeAll(() => {
  dotenvMock.config()
})

describe('Get customer details', () => {
  it('should allow a Manager to get a list of customers', (done) => {
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: () => mongooseMethods,
      select: () => mongooseMethods,
      exec: () => Promise.resolve([])
    }
    jest.spyOn(Customer, 'find')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if an exception occurs in the customer listing', (done) => {
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: () => mongooseMethods,
      exec: () => Promise.resolve([])
    }
    jest.spyOn(Customer, 'find')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should allow a Manager to get a single customer\'s details', (done) => {
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: () => mongooseMethods,
      select: () => mongooseMethods,
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        cpf: 191
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return zero customers if the cpf doesn\'t exists on the database', (done) => {
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: () => mongooseMethods,
      select: () => mongooseMethods,
      exec: () => Promise.resolve(null)
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        cpf: 191
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customers: []
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if single customer query results on exception', (done) => {
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: () => mongooseMethods,
      exec: () => Promise.resolve(null)
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        cpf: 191
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should allow the user to customize the output fields on a single user query', (done) => {
    const fields = {
      default: '',
      customerDocuments: '',
      account: ''
    }
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: (entity, param) => {
        fields[entity] = param
        return mongooseMethods
      },
      select: (param) => {
        fields.default = param
        return mongooseMethods
      },
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }

    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        cpf: 191,
        fields: 'rg cpf name customerDocuments.documentName account.agency account.accountNumber'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        if (fields.default === 'rg cpf name' &&
          fields.customerDocuments === 'documentName' &&
          fields.account === 'agency accountNumber') {
          done()
        } else {
          done('Fields are different than expected')
        }
      })
  })

  it('should prevent the user from seeing the document physical path on the field list', (done) => {
    const fields = {
      default: '',
      customerDocuments: '',
      account: ''
    }
    const mongooseMethods = {
      skip: () => mongooseMethods,
      limit: () => mongooseMethods,
      populate: (entity, param) => {
        fields[entity] = param
        return mongooseMethods
      },
      select: (param) => {
        fields.default = param
        return mongooseMethods
      },
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }

    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        cpf: 191,
        fields: 'rg cpf name customerDocuments.document customerDocuments.documentName account.agency account.accountNumber'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        if (fields.default === 'rg cpf name' &&
          fields.customerDocuments === 'documentName' &&
          fields.account === 'agency accountNumber') {
          done()
        } else {
          done('Fields are different than expected')
        }
      })
  })

  it('should allow the user to customize the output fields on a multi user query', (done) => {
    let limit = 0
    let skip = 0
    const fields = {
      default: '',
      customerDocuments: '',
      account: ''
    }
    const mongooseMethods = {
      skip: (param) => {
        skip = param
        return mongooseMethods
      },
      limit: (param) => {
        limit = param
        return mongooseMethods
      },
      populate: (entity, param) => {
        fields[entity] = param
        return mongooseMethods
      },
      select: (param) => {
        fields.default = param
        return mongooseMethods
      },
      exec: () => Promise.resolve([{
        name: 'test',
        cpf: 191
      }])
    }

    jest.spyOn(Customer, 'find')
      .mockImplementationOnce(() => mongooseMethods)

    request(app)
      .get('/customer')
      .query({
        limit: 10,
        offset: 5,
        fields: 'rg cpf name customerDocuments.document customerDocuments.documentName account.agency account.accountNumber'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        if (limit === 10 &&
          skip === 5 &&
          fields.default === 'rg cpf name' &&
          fields.customerDocuments === 'documentName' &&
          fields.account === 'agency accountNumber') {
          done()
        } else {
          done('Fields are different than expected')
        }
      })
  })

  it('should allow a Client to get his own details', (done) => {
    const findOneCustomerMethods = {
      skip: () => findOneCustomerMethods,
      limit: () => findOneCustomerMethods,
      populate: () => findOneCustomerMethods,
      select: () => findOneCustomerMethods,
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => findOneCustomerMethods)

    const findUserByIdMethods = {
      findById: () => findUserByIdMethods,
      populate: () => findUserByIdMethods,
      select: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          cpf: 191
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    request(app)
      .get('/customer')
      .set('x-access-token', authMock.client.token)
      .query({ cpf: 191 })
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should fill Client\'s cpf automatically if it is not provided', (done) => {
    const findOneCustomerMethods = {
      skip: () => findOneCustomerMethods,
      limit: () => findOneCustomerMethods,
      populate: () => findOneCustomerMethods,
      select: () => findOneCustomerMethods,
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => findOneCustomerMethods)

    const findUserByIdMethods = {
      findById: () => findUserByIdMethods,
      populate: () => findUserByIdMethods,
      select: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          cpf: 191
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    request(app)
      .get('/customer')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK, {
        customers: [{
          name: 'test',
          cpf: 191
        }]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client to get another client\'s details', (done) => {
    const findOneCustomerMethods = {
      skip: () => findOneCustomerMethods,
      limit: () => findOneCustomerMethods,
      populate: () => findOneCustomerMethods,
      select: () => findOneCustomerMethods,
      exec: () => Promise.resolve({
        name: 'test',
        cpf: 191
      })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => findOneCustomerMethods)

    const findUserByIdMethods = {
      findById: () => findUserByIdMethods,
      populate: () => findUserByIdMethods,
      select: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          cpf: 191
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    request(app)
      .get('/customer')
      .query({ cpf: 14789632555 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Insert a new Customer', () => {
  it('should allow a Manager to insert a new Customer', (done) => {
    jest.spyOn(Customer, 'create')
      .mockImplementationOnce(() => Promise.resolve({ cpf: 14789632555 }))

    request(app)
      .post('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.CREATED, {
        customer: { cpf: 14789632555 }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client to insert a new Customer', (done) => {
    request(app)
      .post('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error for an incomplete request', (done) => {
    request(app)
      .post('/customer')
      .send({
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    jest.spyOn(Customer, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Update a new Customer', () => {
  it('should allow a Manager to update a Customer', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve({ cpf: 14789632555 })
      }))

    request(app)
      .put('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customer: { cpf: 14789632555 }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client to update a Customer\'s data', (done) => {
    request(app)
      .put('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the Customer', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(null)
      }))

    request(app)
      .put('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error for an incomplete request', (done) => {
    request(app)
      .put('/customer')
      .send({
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .put('/customer')
      .send({
        cpf: 14789632555,
        name: 'test client'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Insert new Address', () => {
  const requestBodyOK = {
    cpf: 14789632555,
    address: {
      type: 'HOME',
      streetName: 'Test street',
      streetNumber: 12,
      city: 'Franca',
      state: 'SP',
      postalCode: 14400000
    }
  }

  it('should allow a Manager to insert a new Address', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(requestBodyOK)
      }))

    request(app)
      .patch('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.CREATED, {
        customer: requestBodyOK
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client to update a Customer\'s data', (done) => {
    request(app)
      .patch('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the Customer', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(null)
      }))

    request(app)
      .patch('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error for an incomplete request', (done) => {
    request(app)
      .patch('/customer/address')
      .send({
        cpf: 14789632555
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .patch('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Remove an Address', () => {
  const requestBodyOK = {
    cpf: 14789632555,
    address: {
      type: 'HOME',
      streetName: 'Test street',
      streetNumber: 12,
      city: 'Franca',
      state: 'SP',
      postalCode: 14400000
    }
  }

  it('should allow a Manager to insert a new Address', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(requestBodyOK)
      }))

    request(app)
      .delete('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        customer: requestBodyOK
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client to update a Customer\'s data', (done) => {
    request(app)
      .delete('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the Customer', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => ({
        exec: () => Promise.resolve(null)
      }))

    request(app)
      .delete('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error for an incomplete request', (done) => {
    request(app)
      .delete('/customer/address')
      .send({
        cpf: 14789632555
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    jest.spyOn(Customer, 'findOneAndUpdate')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .delete('/customer/address')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
