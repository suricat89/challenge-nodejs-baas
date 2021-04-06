import request from 'supertest'
import app from '../app'
import User from '../model/database/user'
import Account from '../model/database/account'
import Transaction from '../model/database/transaction'
import { StatusCodes } from 'http-status-codes'
import * as authMock from '../__mocks__/authentication'
import dotenvMock from '../__mocks__/dotenv-safe'

beforeAll(() => {
  dotenvMock.config()
})

const spyGetUserAccount = () => {
  const methods = {
    populate: () => methods,
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
    .mockImplementationOnce(() => methods)
}

const spyFindAccountBalance1000 = () => {
  jest.spyOn(Account, 'findOne')
    .mockImplementationOnce(() => ({
      exec: () => Promise.resolve({
        _id: 1,
        agency: 1234,
        accountNumber: 1001234,
        balance: 1000,
        overdraft: 1000
      })
    }))
}

const spyFindAccountBalance100 = () => {
  jest.spyOn(Account, 'findOne')
    .mockImplementationOnce(() => ({
      exec: () => Promise.resolve({
        _id: 2,
        agency: 2345,
        accountNumber: 2001234,
        balance: 100,
        overdraft: 1000
      })
    }))
}

const spyFindAccountNull = () => {
  jest.spyOn(Account, 'findOne')
    .mockImplementationOnce(() => ({
      exec: () => Promise.resolve(null)
    }))
}

const transactionData = []
const spyTransactionCreate = () => {
  jest.spyOn(Transaction, 'create')
    .mockImplementationOnce((data) => {
      transactionData.push(data)
      return Promise.resolve(data)
    })
}

const accountData = []
const spyFindAccountByIdAndUpdate = () => {
  jest.spyOn(Account, 'findByIdAndUpdate')
    .mockImplementationOnce((id, data) => ({
      exec: () => {
        accountData.push(data)
        return data
      }
    }))
}

const spyFindTransactionById = () => {
  const methods = {
    populate: () => methods,
    exec: () => Promise.resolve(transactionData[transactionData.length - 1])
  }
  jest.spyOn(Transaction, 'findById')
    .mockImplementationOnce(() => methods)
}

describe('Simple transaction (deposit, withdraw, debit card)', () => {
  it('should allow a Manager to make a new Withdraw for a customer', (done) => {
    spyFindAccountBalance1000()
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate()
    spyFindTransactionById()

    request(app)
      .post('/transaction/withdraw')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (transactionData.pop().value === 100 &&
          accountData.pop().balance === 900) {
          done()
        } else {
          done('Transaction values did not calculate as expected')
        }
      })
  })

  it('should allow a Client to make a new Deposit on his account', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate()
    spyFindTransactionById()

    request(app)
      .post('/transaction/deposit')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (transactionData.pop().value === 100 &&
          accountData.pop().balance === 1100) {
          done()
        } else {
          done('Transaction values did not calculate as expected')
        }
      })
  })

  it('should fill automatically the client\'s account agency and number in case it is not provided', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate()
    spyFindTransactionById()

    request(app)
      .post('/transaction/debit')
      .send({
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (transactionData.pop().value === 100 &&
          accountData.pop().balance === 900) {
          done()
        } else {
          done('Transaction values did not calculate as expected')
        }
      })
  })

  it('should return an error if a Client tries to make any transaction using another Client\'s account', (done) => {
    spyGetUserAccount()

    request(app)
      .post('/transaction/withdraw')
      .send({
        agency: 5678,
        accountNumber: 2001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error the transaction value is not provided', (done) => {
    spyGetUserAccount()

    request(app)
      .post('/transaction/debit')
      .send({
        agency: 1234,
        accountNumber: 1001234
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it cannot find the provided account', (done) => {
    spyGetUserAccount()
    spyFindAccountNull()

    request(app)
      .post('/transaction/deposit')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the transaction will exceed the customer\'s overdraft value', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()

    request(app)
      .post('/transaction/withdraw')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 2001
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.PRECONDITION_FAILED)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs on the Withdraw', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    jest.spyOn(Transaction, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/transaction/withdraw')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs on the Deposit', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    jest.spyOn(Transaction, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/transaction/deposit')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs on the Debit', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    jest.spyOn(Transaction, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/transaction/debit')
      .send({
        agency: 1234,
        accountNumber: 1001234,
        value: 100
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('P2P transactions', () => {
  it('should allow a Manager to do a P2P transaction beteween 2 customers', (done) => {
    spyFindAccountBalance1000() // originAccount
    spyFindAccountBalance100() // destinationAccount
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate() // originAccount
    spyFindAccountByIdAndUpdate() // destinationAccount
    spyFindTransactionById()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 100
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (accountData.pop().balance === 200 && // destinationAccount
          accountData.pop().balance === 900) { // originAccount
          done()
        } else {
          done('Transaction values are different than expected')
        }
      })
  })

  it('should allow a Client to do a P2P transaction', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000() // originAccount
    spyFindAccountBalance100() // destinationAccount
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate() // originAccount
    spyFindAccountByIdAndUpdate() // destinationAccount
    spyFindTransactionById()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (accountData.pop().balance === 300 && // destinationAccount
          accountData.pop().balance === 800) { // originAccount
          done()
        } else {
          done('Transaction values are different than expected')
        }
      })
  })

  it('should automatically fill the originAccount with the client\'s data in case it is not provided', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000() // originAccount
    spyFindAccountBalance100() // destinationAccount
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate() // originAccount
    spyFindAccountByIdAndUpdate() // destinationAccount
    spyFindTransactionById()

    request(app)
      .post('/transaction/p2p')
      .send({
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 150
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (accountData.pop().balance === 250 && // destinationAccount
          accountData.pop().balance === 850) { // originAccount
          done()
        } else {
          done('Transaction values are different than expected')
        }
      })
  })

  it('should automatically fill the originAccount with the client\'s data in case it is blank', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000() // originAccount
    spyFindAccountBalance100() // destinationAccount
    spyTransactionCreate()
    spyFindAccountByIdAndUpdate() // originAccount
    spyFindAccountByIdAndUpdate() // destinationAccount
    spyFindTransactionById()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {},
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 150
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (accountData.pop().balance === 250 && // destinationAccount
          accountData.pop().balance === 850) { // originAccount
          done()
        } else {
          done('Transaction values are different than expected')
        }
      })
  })

  it('should return an error in case a client tries to do a P2P transaction using another account as origin', (done) => {
    spyGetUserAccount()

    request(app)
      .post('/transaction/p2p')
      .send({
        destinationAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        originAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the transaction values are not provided correctly', (done) => {
    spyGetUserAccount()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 2345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if origin account is the same as the destination account', (done) => {
    spyGetUserAccount()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.PRECONDITION_FAILED)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the origin account', (done) => {
    spyGetUserAccount()
    spyFindAccountNull()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the destination account', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000()
    spyFindAccountNull()

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error in case any exception occurs', (done) => {
    spyGetUserAccount()
    spyFindAccountBalance1000() // originAccount
    spyFindAccountBalance100() // destinationAccount
    jest.spyOn(Transaction, 'create')
      .mockImplementationOnce(() => { throw new Error('test error') })

    request(app)
      .post('/transaction/p2p')
      .send({
        originAccount: {
          agency: 1234,
          accountNumber: 1001234
        },
        destinationAccount: {
          agency: 5678,
          accountNumber: 1002345
        },
        value: 200
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
