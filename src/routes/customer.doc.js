/**
  *
  * @api {get} /customer Gets the customer data
  * @apiName GetCustomer
  * @apiGroup Customer
  * @apiVersion  0.1.0
  *
  *
  * @apiParam  {Number} [cpf] The customer's CPF
  * @apiParam  {String} [fields]        A list of fields that might be on the response. The
  *                                     list can be separated using comma, semicollon or space
  * @apiParam  {Number} [limit=20]      If the manager is listing all customers,
  *                                     this will limit the ammount of data returned
  * @apiParam  {Number} [offset=0]      Will return only customers from this position onwards
  * @apiHeader {String} x-access-token  The JWT token obtained through /user/login
  *
  * @apiParamExample {curl} List customers example
  *   curl --location --request GET 'http://localhost:3000/customer?cpf=14789632555' \
  *   --header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDY4NmNlOWVlNjJlMzNmNzkyYzA5YTMiLCJ1c2VyTmFtZSI6InN1cmljYXQiLCJ1c2VyUHJvZmlsZSI6Ik1BTkFHRVIiLCJpYXQiOjE2MTc0NTgxNDYsImV4cCI6MTYxODA2Mjk0Nn0._m2MJ3ZYk4Wn07oM4Ia5p_a_uGoGOY56JIoN3AruR68'
  *
  * @apiSuccess {Object[]} customers                                 The customers list that have met the `cpf` filter
  * @apiSuccess {String}   customers._id                             Customer's ID on the database
  * @apiSuccess {Number}   customers.cpf                             Customer's CPF
  * @apiSuccess {String}   customers.name                            Customer's name
  * @apiSuccess {String}   customers.rg                              Customer's RG
  * @apiSuccess {Object[]} customers.address                         Customer's address
  * @apiSuccess {String}   customers.address._id                     Customer's address ID
  * @apiSuccess {String}   customers.address.type                    Indicates if this is a Home, business, billing or other address type
  * @apiSuccess {String}   customers.address.streetName              The street name
  * @apiSuccess {Number}   customers.address.streetNumber            The street number
  * @apiSuccess {String}   customers.address.city                    City name
  * @apiSuccess {String}   customers.address.state                   State or province
  * @apiSuccess {String}   customers.address.postalCode              The address postal code
  * @apiSuccess {Object[]} customers.customerDocuments               The customer's list of documents
  * @apiSuccess {String}   customers.customerDocuments._id           The unique document ID on the database
  * @apiSuccess {String}   customers.customerDocuments.documentName  Name unique for each customer
  * @apiSuccess {String}   customers.customerDocuments.documentType  The mime type. eg.: 'application/pdf'
  * @apiSuccess {Object}   customers.account                         The account data of this customer
  * @apiSuccess {Number}   customers.account._id                     The account unique ID on the database
  * @apiSuccess {Number}   customers.account.overdraft               The credit value allowed for this client to stay with negative balance
  * @apiSuccess {Number}   customers.account.agency                  Bank agency number
  * @apiSuccess {Number}   customers.account.accountNumber           Account number unique per agency
  * @apiSuccess {Number}   customers.account.balance                 The current balance of this account
  * @apiSuccess {Object}   customers.user                            The customer's user used to log in the API
  * @apiSuccess {Number}   customers.user._id                        The user's unique ID on the database
  * @apiSuccess {Number}   customers.user.profile                    The user's profile, can be a MANAGER or CLIENT
  * @apiSuccess {Number}   customers.user.userName                   The unique user name used for login and perform operations
  *
  * @apiSuccessExample {json} Success Response
  * HTTP/1.1 200 OK
  * {
  *   "customers": [
  *     {
  *       "customerDocuments": [
  *         {
  *           "_id": "6065502b7145a080110b6d50",
  *           "documentName": "Test Document 2",
  *           "documentType": "application/pdf"
  *         },
  *         {
  *           "_id": "6065ccddbdbed583293836bd",
  *           "documentName": "Test Document",
  *           "documentType": "application/pdf"
  *         }
  *       ],
  *       "_id": "6063b2e3b9d5917b81cf2731",
  *       "cpf": 37976948814,
  *       "name": "Thiago Monteiro de Paula",
  *       "rg": "450056752",
  *       "__v": 0,
  *       "address": [
  *         {
  *           "_id": "60679d9fcadde92b79efa2a8",
  *           "type": "HOME",
  *           "streetName": "Rua Radialista Alfeu Stabelini",
  *           "streetNumber": 1234,
  *           "city": "Franca",
  *           "state": "SP",
  *           "postalCode": "14412314"
  *         }
  *       ],
  *       "account": {
  *         "overdraft": 1000,
  *         "_id": "60665a58beda3670757f2c49",
  *         "agency": 1234,
  *         "accountNumber": 1005002,
  *         "balance": 230
  *       },
  *       "user": {
  *         "profile": "MANAGER",
  *         "_id": "60686ce9ee62e33f792c09a3",
  *         "userName": "suricat"
  *       }
  *     }
  *   ]
  * }
  *
  * @apiUse   AuthenticationError
  * @apiError (Error 403) Forbidden            One client cannot query data from another client
  * @apiError (Error 500) InternalServerError  Error fetching customer
  *
  * @apiErrorExample {json} Error Response
  * HTTP/1.1 403 Forbidden
  * {
  *   "error": "One client cannot query data from another client"
  * }
  */
/*********************************************************************************************/
/**
  *
  * @api {post} /customer Insert a new Customer
  * @apiName PostCustomer
  * @apiGroup Customer
  * @apiVersion  0.1.0
  * @apiPermission Manager
  *
  * @apiParam {Number}   cpf                  Customer's CPF
  * @apiParam {String}   name                 Customer's name
  * @apiParam {String}   [rg]                 Customer's RG
  * @apiParam {Object[]} [address]            Customer's address
  * @apiParam {String}   address.type         Indicates if this is a Home, business, billing or other address type
  * @apiParam {String}   address.streetName   The street name
  * @apiParam {Number}   address.streetNumber The street number
  * @apiParam {String}   address.city         City name
  * @apiParam {String}   address.state        State or province
  * @apiParam {String}   address.postalCode   The address postal code
  *
  * @apiHeader {String} x-access-token
  * The JWT token obtained through /user/login
  *
  * @apiParamExample {json} Insert a new customer
  * {
  *   "cpf": 95569658076,
  *   "name": "Cliente consumidor",
  *   "rg": 3434556645,
  *   "address": [
  *     {
  *       "type": "HOME",
  *       "streetName": "Rua sem nome",
  *       "streetNumber": 12,
  *       "city": "Franca",
  *       "state": "SP",
  *       "postalCode": 14400000
  *     }
  *   ]
  * }
  *
  * @apiSuccess {Object}      customer                      The customer as it was stored in the database
  * @apiSuccess {String}      customer._id                  Customer's ID on the database
  * @apiSuccess {Number}      customer.cpf                  Customer's CPF
  * @apiSuccess {String}      customer.name                 Customer's name
  * @apiSuccess {String}      customer.rg                   Customer's RG
  * @apiSuccess {Object[]}    customer.address              Customer's address
  * @apiSuccess {String}      customer.address._id          Customer's address ID
  * @apiSuccess {String}      customer.address.type         Indicates if this is a Home, business, billing or other address type
  * @apiSuccess {String}      customer.address.streetName   The street name
  * @apiSuccess {Number}      customer.address.streetNumber The street number
  * @apiSuccess {String}      customer.address.city         City name
  * @apiSuccess {String}      customer.address.state        State or province
  * @apiSuccess {String}      customer.address.postalCode   The address postal code
  * @apiSuccess {ObjectId[]}  customer.customerDocuments    The ObjectId that references this customer's documents
  *
  * @apiSuccessExample {json} Success Response
  * HTTP/1.1 200 OK
  * {
  *   "customer": {
  *     "customerDocuments": [],
  *     "_id": "6063b2e3b9d5917b81cf2731",
  *     "cpf": 37976948814,
  *     "name": "Thiago Monteiro de Paula",
  *     "rg": "450056752",
  *     "__v": 0,
  *     "address": [
  *       {
  *         "_id": "60679d9fcadde92b79efa2a8",
  *         "type": "HOME",
  *         "streetName": "Rua Radialista Alfeu Stabelini",
  *         "streetNumber": 1234,
  *         "city": "Franca",
  *         "state": "SP",
  *         "postalCode": "14412314"
  *       }
  *     ]
  *   }
  * }
  *
  * @apiUse   AuthenticationError
  * @apiError (Error 403) Forbidden            Only a manager can insert new customers
  * @apiError (Error 400) BadRequest           If the request body is missing any required field
  * @apiError (Error 500) InternalServerError  Error creating customer
  *
  * @apiErrorExample {json} Error Response
  * HTTP/1.1 403 Forbidden
  * {
  *   "error": "Only a manager can insert new customers"
  * }
  */
/*********************************************************************************************/
/**
  *
  * @api {put} /customer Update an existing Customer
  * @apiName PutCustomer
  * @apiGroup Customer
  * @apiVersion  0.1.0
  * @apiPermission Manager
  *
  * @apiParam {Number}   cpf                  Customer's CPF
  * @apiParam {String}   [name]               Customer's name
  * @apiParam {String}   [rg]                 Customer's RG
  * @apiParam {Object[]} [address]            Customer's address
  * @apiParam {String}   address.type         Indicates if this is a Home, business, billing or other address type
  * @apiParam {String}   address.streetName   The street name
  * @apiParam {Number}   address.streetNumber The street number
  * @apiParam {String}   address.city         City name
  * @apiParam {String}   address.state        State or province
  * @apiParam {String}   address.postalCode   The address postal code
  *
  * @apiHeader {String} x-access-token
  * The JWT token obtained through /user/login
  *
  * @apiParamExample {json} Update an existing Customer
  * {
  *   "cpf": 95569658076,
  *   "name": "Cliente consumidor",
  *   "rg": 3434556645,
  *   "address": [
  *     {
  *       "type": "HOME",
  *       "streetName": "Rua sem nome",
  *       "streetNumber": 12,
  *       "city": "Franca",
  *       "state": "SP",
  *       "postalCode": 14400000
  *     }
  *   ]
  * }
  *
  * @apiSuccess {Object}      customer                      The customer as it was stored in the database
  * @apiSuccess {String}      customer._id                  Customer's ID on the database
  * @apiSuccess {Number}      customer.cpf                  Customer's CPF
  * @apiSuccess {String}      customer.name                 Customer's name
  * @apiSuccess {String}      customer.rg                   Customer's RG
  * @apiSuccess {Object[]}    customer.address              Customer's address
  * @apiSuccess {String}      customer.address._id          Customer's address ID
  * @apiSuccess {String}      customer.address.type         Indicates if this is a Home, business, billing or other address type
  * @apiSuccess {String}      customer.address.streetName   The street name
  * @apiSuccess {Number}      customer.address.streetNumber The street number
  * @apiSuccess {String}      customer.address.city         City name
  * @apiSuccess {String}      customer.address.state        State or province
  * @apiSuccess {String}      customer.address.postalCode   The address postal code
  * @apiSuccess {ObjectId[]}  customer.customerDocuments    The ObjectId that references this customer's documents
  * @apiSuccess {ObjectId}    customer.account              The ObjectId that references this customer's account
  * @apiSuccess {ObjectId}    customer.user                 The ObjectId that references this customer's user
  *
  * @apiSuccessExample {json} Success Response
  * HTTP/1.1 200 OK
  * {
  *   "customer": {
  *     "customerDocuments": [],
  *     "_id": "6063b2e3b9d5917b81cf2731",
  *     "cpf": 37976948814,
  *     "name": "Thiago Monteiro de Paula",
  *     "rg": "450056752",
  *     "__v": 0,
  *     "address": [
  *       {
  *         "_id": "60679d9fcadde92b79efa2a8",
  *         "type": "HOME",
  *         "streetName": "Rua Radialista Alfeu Stabelini",
  *         "streetNumber": 1234,
  *         "city": "Franca",
  *         "state": "SP",
  *         "postalCode": "14412314"
  *       }
  *     ]
  *   }
  * }
  *
  * @apiUse   AuthenticationError
  * @apiError (Error 403) Forbidden            Only a manager can update a customer's data
  * @apiError (Error 400) BadRequest           If the request body is missing any required field
  * @apiError (Error 404) NotFound             Customer not found
  * @apiError (Error 500) InternalServerError  Error updating customer
  *
  * @apiErrorExample {json} Error Response
  * HTTP/1.1 403 Forbidden
  * {
  *   "error": "Only a manager can update a customer's data"
  * }
  */
/*********************************************************************************************/
/**
  *
  * @api {patch} /customer/address Insert a new customers's address
  * @apiName PatchCustomerAddress
  * @apiGroup Customer
  * @apiVersion  0.1.0
  * @apiPermission Manager
  *
  * @apiParam {Number}   cpf                  Customer's CPF
  * @apiParam {Object}   address              Customer's address
  * @apiParam {String}   address.type         Indicates if this is a Home, business, billing or other address type
  * @apiParam {String}   address.streetName   The street name
  * @apiParam {Number}   address.streetNumber The street number
  * @apiParam {String}   address.city         City name
  * @apiParam {String}   address.state        State or province
  * @apiParam {String}   address.postalCode   The address postal code
  *
  * @apiHeader {String} x-access-token
  * The JWT token obtained through /user/login
  *
  * @apiParamExample {json} Update an existing Customer
  * {
  *   "cpf": 95569658076,
  *   "address": {
  *     "type": "HOME",
  *     "streetName": "Rua sem nome",
  *     "streetNumber": 12,
  *     "city": "Franca",
  *     "state": "SP",
  *     "postalCode": 14400000
  *   }
  * }
  *
  * @apiSuccess {Object}      customer                      The customer as it was stored in the database
  * @apiSuccess {String}      customer._id                  Customer's ID on the database
  * @apiSuccess {Number}      customer.cpf                  Customer's CPF
  * @apiSuccess {String}      customer.name                 Customer's name
  * @apiSuccess {String}      customer.rg                   Customer's RG
  * @apiSuccess {Object[]}    customer.address              Customer's address
  * @apiSuccess {String}      customer.address._id          Customer's address ID
  * @apiSuccess {String}      customer.address.type         Indicates if this is a Home, business, billing or other address type
  * @apiSuccess {String}      customer.address.streetName   The street name
  * @apiSuccess {Number}      customer.address.streetNumber The street number
  * @apiSuccess {String}      customer.address.city         City name
  * @apiSuccess {String}      customer.address.state        State or province
  * @apiSuccess {String}      customer.address.postalCode   The address postal code
  * @apiSuccess {ObjectId[]}  customer.customerDocuments    The ObjectId that references this customer's documents
  * @apiSuccess {ObjectId}    customer.account              The ObjectId that references this customer's account
  * @apiSuccess {ObjectId}    customer.user                 The ObjectId that references this customer's user
  *
  * @apiSuccessExample {json} Success Response
  * HTTP/1.1 201 CREATED
  * {
  *   "customer": {
  *     "customerDocuments": [],
  *     "_id": "6063b2e3b9d5917b81cf2731",
  *     "cpf": 37976948814,
  *     "name": "Thiago Monteiro de Paula",
  *     "rg": "450056752",
  *     "__v": 0,
  *     "address": [
  *       {
  *         "_id": "60679d9fcadde92b79efa2a8",
  *         "type": "HOME",
  *         "streetName": "Rua Radialista Alfeu Stabelini",
  *         "streetNumber": 1234,
  *         "city": "Franca",
  *         "state": "SP",
  *         "postalCode": "14412314"
  *       }
  *     ]
  *   }
  * }
  *
  * @apiUse   AuthenticationError
  * @apiError (Error 403) Forbidden            Only a manager can update a customer's data
  * @apiError (Error 400) BadRequest           If the request body is missing any required field
  * @apiError (Error 404) NotFound             Customer not found
  * @apiError (Error 500) InternalServerError  Error updating customer
  *
  * @apiErrorExample {json} Error Response
  * HTTP/1.1 403 Forbidden
  * {
  *   "error": "Only a manager can update a customer's data"
  * }
  */
/*********************************************************************************************/
/**
  *
  * @api {delete} /customer/address Removes a customer's address
  * @apiName DeleteCustomerAddress
  * @apiGroup Customer
  * @apiVersion  0.1.0
  * @apiPermission Manager
  *
  * @apiParam {Number}   cpf                    Customer's CPF
  * @apiParam {Object}   address                Customer's address
  * @apiParam {String}   [address.type]         Indicates if this is a Home, business, billing or other address type
  * @apiParam {String}   [address.streetName]   The street name
  * @apiParam {Number}   [address.streetNumber] The street number
  * @apiParam {String}   [address.city]         City name
  * @apiParam {String}   [address.state]        State or province
  * @apiParam {String}   [address.postalCode]   The address postal code
  *
  * @apiHeader {String} x-access-token
  * The JWT token obtained through /user/login
  *
  * @apiParamExample {json} Update an existing Customer
  * {
  *   "cpf": 95569658076,
  *   "address": {
  *     "type": "HOME"
  *   }
  * }
  *
  * @apiSuccess {Object}      customer                      The customer as it was stored in the database
  * @apiSuccess {String}      customer._id                  Customer's ID on the database
  * @apiSuccess {Number}      customer.cpf                  Customer's CPF
  * @apiSuccess {String}      customer.name                 Customer's name
  * @apiSuccess {String}      customer.rg                   Customer's RG
  * @apiSuccess {Object[]}    customer.address              Customer's address
  * @apiSuccess {String}      customer.address._id          Customer's address ID
  * @apiSuccess {String}      customer.address.type         Indicates if this is a Home, business, billing or other address type
  * @apiSuccess {String}      customer.address.streetName   The street name
  * @apiSuccess {Number}      customer.address.streetNumber The street number
  * @apiSuccess {String}      customer.address.city         City name
  * @apiSuccess {String}      customer.address.state        State or province
  * @apiSuccess {String}      customer.address.postalCode   The address postal code
  * @apiSuccess {ObjectId[]}  customer.customerDocuments    The ObjectId that references this customer's documents
  * @apiSuccess {ObjectId}    customer.account              The ObjectId that references this customer's account
  * @apiSuccess {ObjectId}    customer.user                 The ObjectId that references this customer's user
  *
  * @apiSuccessExample {json} Success Response
  * HTTP/1.1 201 CREATED
  * {
  *   "customer": {
  *     "customerDocuments": [],
  *     "_id": "6063b2e3b9d5917b81cf2731",
  *     "cpf": 37976948814,
  *     "name": "Thiago Monteiro de Paula",
  *     "rg": "450056752",
  *     "__v": 0,
  *     "address": [
  *       {
  *         "_id": "60679d9fcadde92b79efa2a8",
  *         "type": "HOME",
  *         "streetName": "Rua Radialista Alfeu Stabelini",
  *         "streetNumber": 1234,
  *         "city": "Franca",
  *         "state": "SP",
  *         "postalCode": "14412314"
  *       }
  *     ]
  *   }
  * }
  *
  * @apiUse   AuthenticationError
  * @apiError (Error 403) Forbidden            Only a manager can update a customer's data
  * @apiError (Error 400) BadRequest           If the request body is missing any required field
  * @apiError (Error 404) NotFound             Customer not found
  * @apiError (Error 500) InternalServerError  Error updating customer
  *
  * @apiErrorExample {json} Error Response
  * HTTP/1.1 403 Forbidden
  * {
  *   "error": "Only a manager can update a customer's data"
  * }
  */
/*********************************************************************************************/
