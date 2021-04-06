import request from 'supertest'
import app from '../app'
import User from '../model/database/user'
import Account from '../model/database/account'
import Customer from '../model/database/customer'
import { StatusCodes } from 'http-status-codes'
import * as authMock from '../__mocks__/authentication'
import dotenvMock from '../__mocks__/dotenv-safe'

beforeAll(() => {
  dotenvMock.config()
})

describe('Create an Account', () => {
  const requestBodyOK = {
    cpf: 95569658076,
    agency: 5678,
    accountNumber: 33448899
  }

  it('should allow a Manager create an Account', (done) => {
    const mongooseFindOne = {
      findOne: () => mongooseFindOne,
      populate: () => mongooseFindOne,
      exec: () => Promise.resolve({ cpf: 95569658076 })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseFindOne)

    jest.spyOn(Account, 'create')
      .mockImplementationOnce(() => requestBodyOK)

    const mongooseFindByIdAndUpdate = {
      findByIdAndUpdate: () => mongooseFindOne,
      populate: () => mongooseFindOne,
      exec: () => Promise.resolve({ cpf: 95569658076 })
    }
    jest.spyOn(Customer, 'findByIdAndUpdate')
      .mockImplementationOnce(() => mongooseFindByIdAndUpdate)

    request(app)
      .post('/customer/account')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.CREATED, {
        customer: { cpf: 95569658076 }
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('shouldn\'t allow a Client create an account', (done) => {
    request(app)
      .post('/customer/account')
      .send(requestBodyOK)
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the Customer', (done) => {
    const mongooseFindOne = {
      findOne: () => mongooseFindOne,
      populate: () => mongooseFindOne,
      exec: () => Promise.resolve(null)
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseFindOne)

    request(app)
      .post('/customer/account')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the customer already have an account', (done) => {
    const mongooseFindOne = {
      findOne: () => mongooseFindOne,
      populate: () => mongooseFindOne,
      exec: () => Promise.resolve({
        cpf: 95569658076,
        account: {
          agency: 1234,
          accountNumber: 10051234
        }
      })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseFindOne)

    request(app)
      .post('/customer/account')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.PRECONDITION_FAILED)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error for an incomplete request', (done) => {
    request(app)
      .post('/customer/account')
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
    const mongooseFindOne = {
      populate: () => mongooseFindOne,
      exec: () => Promise.resolve({ cpf: 95569658076 })
    }
    jest.spyOn(Customer, 'findOne')
      .mockImplementationOnce(() => mongooseFindOne)

    jest.spyOn(Account, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/customer/account')
      .send(requestBodyOK)
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('List accounts', () => {
  it('should allow a Manager to list a client\'s account', (done) => {
    const findMethods = {
      populate: () => findMethods,
      limit: () => findMethods,
      skip: () => findMethods,
      exec: () => Promise.resolve([{ agency: 1234, accountNumber: 100123 }])
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .query({ agency: 1234, accountNumber: 100123 })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        accounts: [
          { agency: 1234, accountNumber: 100123 }
        ]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should allow a Manager to list all client\'s accounts', (done) => {
    const findMethods = {
      populate: () => findMethods,
      limit: () => findMethods,
      skip: () => findMethods,
      exec: () => Promise.resolve([{ agency: 1234, accountNumber: 100123 }])
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        accounts: [
          { agency: 1234, accountNumber: 100123 }
        ]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should allow the user to specify the limit and skip values on accounts list', (done) => {
    let limitValue = 0
    let skipValue = 0
    const findMethods = {
      populate: () => findMethods,
      limit: (param) => {
        limitValue = param
        return findMethods
      },
      skip: (param) => {
        skipValue = param
        return findMethods
      },
      exec: () => Promise.resolve([{ agency: 1234, accountNumber: 100123 }])
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .query({ limit: 50, offset: 10 })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK, {
        accounts: [
          { agency: 1234, accountNumber: 100123 }
        ]
      })
      .end((err, res) => {
        if (err) return done(err)
        if (limitValue === 50 && skipValue === 10) {
          done()
        } else done('Skip and limit values different than expected')
      })
  })

  it('should allow a Client to list his own account', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 100123
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    const findMethods = {
      populate: () => findMethods,
      limit: () => findMethods,
      skip: () => findMethods,
      exec: () => Promise.resolve([{ agency: 1234, accountNumber: 100123 }])
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .query({ agency: 1234, accountNumber: 100123 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK, {
        accounts: [
          { agency: 1234, accountNumber: 100123 }
        ]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if a Client try list another client\'s account', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 100123
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    request(app)
      .get('/customer/account/list')
      .query({ agency: 1, accountNumber: 1234512 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should fill the Client\'s account number automatically if none is provided', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 100123
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    const findMethods = {
      populate: () => findMethods,
      limit: () => findMethods,
      skip: () => findMethods,
      exec: () => Promise.resolve([{ agency: 1234, accountNumber: 100123 }])
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK, {
        accounts: [
          { agency: 1234, accountNumber: 100123 }
        ]
      })
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurrs', (done) => {
    const findMethods = {
      populate: () => findMethods,
      limit: () => findMethods,
      skip: () => findMethods,
      exec: () => { throw new Error('test error') }
    }
    jest.spyOn(Account, 'find')
      .mockImplementationOnce(() => findMethods)

    request(app)
      .get('/customer/account/list')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Get account data', () => {
  const responseOk = {
    agency: 1234,
    accountNumber: 1001234,
    transactions: [
      {
        balanceAfter: 0,
        transaction: null
      },
      {
        balanceAfter: 100,
        transaction: {
          transactionType: 'DEPOSIT',
          dateTime: new Date('2021-04-01T13:01:02.000Z'),
          value: 100
        }
      },
      {
        balanceAfter: 0,
        transaction: {
          transactionType: 'WITHDRAW',
          dateTime: new Date('2021-04-02T13:01:02.000Z'),
          value: 100
        }
      },
      {
        balanceAfter: -50,
        transaction: {
          transactionType: 'DEBIT',
          dateTime: new Date('2021-04-03T13:01:02.000Z'),
          value: 50
        }
      }
    ]
  }
  it('should allow a Manager to get a Client\'s account data', (done) => {
    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve(responseOk)
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({ agency: 1234, accountNumber: 1001234 })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.account.transactions.length === 3) {
          done()
        } else {
          done('Transactions ammount different than expected')
        }
      })
  })

  it('should allow a Client to get his own data', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 1001234
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve(responseOk)
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({ agency: 1234, accountNumber: 1001234 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.account.transactions.length === 3) {
          done()
        } else {
          done('Transactions ammount different than expected')
        }
      })
  })

  it('should fill automatically the account data in case the Client didn\'t provide it', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 1001234
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve(responseOk)
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.account.transactions.length === 3) {
          done()
        } else {
          done('Transactions ammount different than expected')
        }
      })
  })

  it('should return an error if a Client tries to fetch another client\'s data', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 1001234
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    request(app)
      .get('/customer/account')
      .query({ agency: 5678, accountNumber: 2001234 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error a Manager don\'t provide the client\'s account', (done) => {
    request(app)
      .get('/customer/account')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should allow the user to specify a date period to fetch the transactions list', (done) => {
    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve(responseOk)
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({
        agency: 1234,
        accountNumber: 1001234,
        startDate: '2021-04-02T00:00:00.000Z',
        endDate: '2021-04-04T00:00:00.000Z'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.account.transactions.length === 3) {
          done()
        } else {
          done('Transactions ammount different than expected')
        }
      })
  })

  it('should return successfully an account with no transactions registered', (done) => {
    const findUserByIdMethods = {
      populate: () => findUserByIdMethods,
      exec: () => Promise.resolve({
        customer: {
          account: {
            agency: 1234,
            accountNumber: 1001234
          }
        }
      })
    }
    jest.spyOn(User, 'findById')
      .mockImplementationOnce(() => findUserByIdMethods)

    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve({
        agency: 1234,
        accountNumber: 1001234,
        transactions: []
      })
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({ agency: 1234, accountNumber: 1001234 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.account.transactions.length === 0) {
          done()
        } else {
          done('Transactions ammount different than expected')
        }
      })
  })

  it('should return an error if the startDate is invalid', (done) => {
    request(app)
      .get('/customer/account')
      .query({
        agency: 1234,
        accountNumber: 1001234,
        startDate: 'asdfasdf',
        endDate: '2021-04-04T00:00:00.000Z'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the endDate is invalid', (done) => {
    request(app)
      .get('/customer/account')
      .query({
        agency: 1234,
        accountNumber: 1001234,
        startDate: '2021-04-02T00:00:00.000Z',
        endDate: 'asdfasdf'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if there is no account with the provided filter', (done) => {
    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => Promise.resolve(null)
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({
        agency: 1234,
        accountNumber: 1001234,
        startDate: '2021-04-02T00:00:00.000Z',
        endDate: '2021-04-04T00:00:00.000Z'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs', (done) => {
    const findOneAccountMethods = {
      populate: () => findOneAccountMethods,
      exec: () => { throw new Error('test error') }
    }
    jest.spyOn(Account, 'findOne')
      .mockImplementationOnce(() => findOneAccountMethods)

    request(app)
      .get('/customer/account')
      .query({
        agency: 1234,
        accountNumber: 1001234
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
