import request from 'supertest'
import app from '../app'
import User from '../model/database/user'
import Customer from '../model/database/customer'
import { StatusCodes } from 'http-status-codes'
import * as authMock from '../__mocks__/authentication'
import dotenvMock from '../__mocks__/dotenv-safe'
import CustomerDocument from '../model/database/customerDocument'

beforeAll(() => {
  dotenvMock.config()
  jest.mock('fs')
})

const spyGetUserCustomer = () => {
  const methods = {
    populate: () => methods,
    select: () => methods,
    exec: () => Promise.resolve({
      customer: {
        cpf: 191
      }
    })
  }
  jest.spyOn(User, 'findById')
    .mockImplementationOnce(() => methods)
}

const spyFindOneCustomer = (exception = false, findCustomer = true, documents = true) => {
  const methods = {
    populate: () => methods,
    select: () => methods,
    exec: () => {
      if (exception) throw new Error('test error')
      if (findCustomer) {
        return Promise.resolve({
          _id: 1,
          cpf: 191,
          customerDocuments: documents
            ? [
                { documentName: 'doc1', document: 'testFile.pdf' },
                { documentName: 'doc2', document: 'testFile.pdf' }
              ]
            : []
        })
      } else return Promise.resolve(null)
    }
  }
  jest.spyOn(Customer, 'findOne')
    .mockImplementationOnce(() => methods)
}

const spyCreateDocument = (exception = false) => {
  jest.spyOn(CustomerDocument, 'create')
    .mockImplementationOnce((data) => {
      if (exception) throw new Error('test error')
      else return Promise.resolve({ ...data, _id: 1 })
    })
}

const spyFindCustomerDocumentById = (exception = false, findDocument = true, anotherCustomer = false) => {
  const methods = {
    populate: () => methods,
    exec: () => {
      if (exception) throw new Error('test error')
      return Promise.resolve(findDocument
        ? {
            _id: 1,
            documentName: 'doc1',
            document: 'testFile.pdf',
            customer: {
              cpf: anotherCustomer ? 494 : 191
            }
          }
        : null)
    }
  }
  jest.spyOn(CustomerDocument, 'findById')
    .mockImplementationOnce(() => methods)
}

const spyFindCustomerByIdAndUpdate = (exception = false) => {
  const methods = (filter, data) => ({
    populate: () => methods(filter, data),
    exec: () => {
      if (exception) throw new Error('test error')
      else return Promise.resolve(data)
    }
  })
  jest.spyOn(Customer, 'findByIdAndUpdate')
    .mockImplementationOnce(methods)
}

describe('Send a new document', () => {
  it('should allow a Manager to upload documents for their customers', (done) => {
    spyFindOneCustomer()
    spyFindOneCustomer()
    spyCreateDocument()
    spyFindCustomerByIdAndUpdate()

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customer.customerDocuments.length === 3) done()
        else done('Document was not uploaded as a new doc')
      })
  })

  it('should allow a Client to upload a document for his own profile', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()
    spyFindOneCustomer()
    spyCreateDocument()
    spyFindCustomerByIdAndUpdate()

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customer.customerDocuments.length === 3) done()
        else done('Document was not uploaded as a new doc')
      })
  })

  it('should fill automatically the client\'s cpf if none is provided', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()
    spyFindOneCustomer()
    spyCreateDocument()
    spyFindCustomerByIdAndUpdate()

    request(app)
      .post('/customer/document')
      .field({
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customer.customerDocuments.length === 3) done()
        else done('Document was not uploaded as a new doc')
      })
  })

  it('should replace an already existing document if another with the same name is sent', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()
    spyFindOneCustomer()
    spyCreateDocument()
    spyFindCustomerByIdAndUpdate()

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'doc1'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customer.customerDocuments.length === 2) done()
        else done('Document did not replace the old document')
      })
  })

  it('should return an error if a Client tries to upload a document to another Client\'s profile', (done) => {
    spyGetUserCustomer()

    request(app)
      .post('/customer/document')
      .field({
        cpf: 949,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the request data is incomplete', (done) => {
    spyGetUserCustomer()

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it cannot find the customer on file validation', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(false, false)

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it cannot find the customer after the file was uploaded', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()
    spyFindOneCustomer(false, false)

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if an exception occurs in the customer query', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(true)

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if there is no document file attached', (done) => {
    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs while updating the documents list', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()
    spyFindOneCustomer()
    spyCreateDocument()
    spyFindCustomerByIdAndUpdate(true)

    request(app)
      .post('/customer/document')
      .field({
        cpf: 191,
        documentName: 'Test Document'
      })
      .attach('document', 'testFile.pdf')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Get document list', () => {
  it('should allow a Manager to get a client\'s documents list', (done) => {
    spyFindOneCustomer()

    request(app)
      .get('/customer/document/list')
      .query({ cpf: 191 })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customerDocuments.length === 2) done()
        else done('Ammount of documents returned different than expected')
      })
  })

  it('should allow a Client to get his own documents list', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()

    request(app)
      .get('/customer/document/list')
      .query({ cpf: 191 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customerDocuments.length === 2) done()
        else done('Ammount of documents returned different than expected')
      })
  })

  it('should automatically fill client\'s cpf in case it was not provided', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()

    request(app)
      .get('/customer/document/list')
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body.customerDocuments.length === 2) done()
        else done('Ammount of documents returned different than expected')
      })
  })

  it('should return an error if a Client tries to list another client\'s document list', (done) => {
    spyGetUserCustomer()

    request(app)
      .get('/customer/document/list')
      .query({ cpf: 949 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if a Manager does not specify a client\'s CPF to get the documents list', (done) => {
    request(app)
      .get('/customer/document/list')
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if it can\'t find the customer', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(false, false)

    request(app)
      .get('/customer/document/list')
      .query({ cpf: 191 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(true)

    request(app)
      .get('/customer/document/list')
      .query({ cpf: 191 })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})

describe('Download a document', () => {
  it('should allow a Manager to download a client\'s document', (done) => {
    spyFindOneCustomer()

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191,
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.manager.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body && res.type === 'application/pdf') done()
        else done('File was not downloaded as expected')
      })
  })

  it('should allow a Client to download his own document using CPF and document name', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191,
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body && res.type === 'application/pdf') done()
        else done('File was not downloaded as expected')
      })
  })

  it('should allow a Client to download his own document using the document ID', (done) => {
    spyGetUserCustomer()
    spyFindCustomerDocumentById()

    request(app)
      .get('/customer/document')
      .query({
        documentId: 1
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body && res.type === 'application/pdf') done()
        else done('File was not downloaded as expected')
      })
  })

  it('should automatically fill the client\'s cpf in case he didn\'t provide it', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()

    request(app)
      .get('/customer/document')
      .query({
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err)
        if (res.body && res.type === 'application/pdf') done()
        else done('File was not downloaded as expected')
      })
  })

  it('should return an error if the request data is incomplete', (done) => {
    spyGetUserCustomer()

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.BAD_REQUEST)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if a Client tries to download another client\'s document using cpf and document name filter', (done) => {
    spyGetUserCustomer()

    request(app)
      .get('/customer/document')
      .query({
        cpf: 949,
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if no customer was found', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(false, false)

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191,
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the document was not found using cpf and document name filter', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer()

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191,
        documentName: 'doc3'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs while filtering with cpf and document name', (done) => {
    spyGetUserCustomer()
    spyFindOneCustomer(true)

    request(app)
      .get('/customer/document')
      .query({
        cpf: 191,
        documentName: 'doc1'
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if a Client tries to download another client\'s document using document id filter', (done) => {
    spyGetUserCustomer()
    spyFindCustomerDocumentById(false, true, true)

    request(app)
      .get('/customer/document')
      .query({
        documentId: 1
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.FORBIDDEN)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if the document was not found using document ID filter', (done) => {
    spyGetUserCustomer()
    spyFindCustomerDocumentById(false, false)

    request(app)
      .get('/customer/document')
      .query({
        documentId: 1
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.NOT_FOUND)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('should return an error if any exception occurs while filtering with document ID', (done) => {
    spyGetUserCustomer()
    spyFindCustomerDocumentById(true)

    request(app)
      .get('/customer/document')
      .query({
        documentId: 1
      })
      .set('x-access-token', authMock.client.token)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
