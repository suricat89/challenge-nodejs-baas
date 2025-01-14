define({ "api": [
  {
    "type": "delete",
    "url": "/customer/address",
    "title": "Removes a customer's address",
    "name": "DeleteCustomerAddress",
    "group": "Customer",
    "version": "0.1.0",
    "permission": [
      {
        "name": "Manager",
        "title": "Manager profile required",
        "description": "<p>This action can only be performed by a user with Manager profile</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address.postalCode",
            "description": "<p>The address postal code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Update an existing Customer",
          "content": "{\n  \"cpf\": 95569658076,\n  \"address\": {\n    \"type\": \"HOME\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>The JWT token obtained through /user/login</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customer",
            "description": "<p>The customer as it was stored in the database</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer._id",
            "description": "<p>Customer's ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customer.address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address._id",
            "description": "<p>Customer's address ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.postalCode",
            "description": "<p>The address postal code</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId[]",
            "optional": false,
            "field": "customer.customerDocuments",
            "description": "<p>The ObjectId that references this customer's documents</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.account",
            "description": "<p>The ObjectId that references this customer's account</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.user",
            "description": "<p>The ObjectId that references this customer's user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 201 CREATED\n{\n  \"customer\": {\n    \"customerDocuments\": [],\n    \"_id\": \"6063b2e3b9d5917b81cf2731\",\n    \"cpf\": 37976948814,\n    \"name\": \"Thiago Monteiro de Paula\",\n    \"rg\": \"450056752\",\n    \"__v\": 0,\n    \"address\": [\n      {\n        \"_id\": \"60679d9fcadde92b79efa2a8\",\n        \"type\": \"HOME\",\n        \"streetName\": \"Rua Radialista Alfeu Stabelini\",\n        \"streetNumber\": 1234,\n        \"city\": \"Franca\",\n        \"state\": \"SP\",\n        \"postalCode\": \"14412314\"\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Only a manager can update a customer's data</p>"
          }
        ],
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If the request body is missing any required field</p>"
          }
        ],
        "Error 404": [
          {
            "group": "Error 404",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Customer not found</p>"
          }
        ],
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Error updating customer</p>"
          },
          {
            "group": "Error 500",
            "optional": false,
            "field": "JwtInternalServerError",
            "description": "<p>Unexpected error verifying JWT token</p>"
          }
        ],
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>'x-access-token' was not provided on request headers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": \"Only a manager can update a customer's data\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./src/routes/customer.doc.js",
    "groupTitle": "Customer",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/customer/address"
      }
    ]
  },
  {
    "type": "get",
    "url": "/customer",
    "title": "Gets the customer data",
    "name": "GetCustomer",
    "group": "Customer",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "cpf",
            "description": "<p>The customer's CPF</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "fields",
            "description": "<p>A list of fields that might be on the response. The list can be separated using comma, semicollon or space</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>If the manager is listing all customers, this will limit the ammount of data returned</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "offset",
            "defaultValue": "0",
            "description": "<p>Will return only customers from this position onwards</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "List customers example",
          "content": "curl --location --request GET 'http://localhost:3000/customer?cpf=14789632555' \\\n--header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDY4NmNlOWVlNjJlMzNmNzkyYzA5YTMiLCJ1c2VyTmFtZSI6InN1cmljYXQiLCJ1c2VyUHJvZmlsZSI6Ik1BTkFHRVIiLCJpYXQiOjE2MTc0NTgxNDYsImV4cCI6MTYxODA2Mjk0Nn0._m2MJ3ZYk4Wn07oM4Ia5p_a_uGoGOY56JIoN3AruR68'",
          "type": "curl"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>The JWT token obtained through /user/login</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customers",
            "description": "<p>The customers list that have met the <code>cpf</code> filter</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers._id",
            "description": "<p>Customer's ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customers.address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address._id",
            "description": "<p>Customer's address ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.address.postalCode",
            "description": "<p>The address postal code</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customers.customerDocuments",
            "description": "<p>The customer's list of documents</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.customerDocuments._id",
            "description": "<p>The unique document ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.customerDocuments.documentName",
            "description": "<p>Name unique for each customer</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customers.customerDocuments.documentType",
            "description": "<p>The mime type. eg.: 'application/pdf'</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customers.account",
            "description": "<p>The account data of this customer</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.account._id",
            "description": "<p>The account unique ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.account.overdraft",
            "description": "<p>The credit value allowed for this client to stay with negative balance</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.account.agency",
            "description": "<p>Bank agency number</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.account.accountNumber",
            "description": "<p>Account number unique per agency</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.account.balance",
            "description": "<p>The current balance of this account</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customers.user",
            "description": "<p>The customer's user used to log in the API</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.user._id",
            "description": "<p>The user's unique ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.user.profile",
            "description": "<p>The user's profile, can be a MANAGER or CLIENT</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customers.user.userName",
            "description": "<p>The unique user name used for login and perform operations</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  \"customers\": [\n    {\n      \"customerDocuments\": [\n        {\n          \"_id\": \"6065502b7145a080110b6d50\",\n          \"documentName\": \"Test Document 2\",\n          \"documentType\": \"application/pdf\"\n        },\n        {\n          \"_id\": \"6065ccddbdbed583293836bd\",\n          \"documentName\": \"Test Document\",\n          \"documentType\": \"application/pdf\"\n        }\n      ],\n      \"_id\": \"6063b2e3b9d5917b81cf2731\",\n      \"cpf\": 37976948814,\n      \"name\": \"Thiago Monteiro de Paula\",\n      \"rg\": \"450056752\",\n      \"__v\": 0,\n      \"address\": [\n        {\n          \"_id\": \"60679d9fcadde92b79efa2a8\",\n          \"type\": \"HOME\",\n          \"streetName\": \"Rua Radialista Alfeu Stabelini\",\n          \"streetNumber\": 1234,\n          \"city\": \"Franca\",\n          \"state\": \"SP\",\n          \"postalCode\": \"14412314\"\n        }\n      ],\n      \"account\": {\n        \"overdraft\": 1000,\n        \"_id\": \"60665a58beda3670757f2c49\",\n        \"agency\": 1234,\n        \"accountNumber\": 1005002,\n        \"balance\": 230\n      },\n      \"user\": {\n        \"profile\": \"MANAGER\",\n        \"_id\": \"60686ce9ee62e33f792c09a3\",\n        \"userName\": \"suricat\"\n      }\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>One client cannot query data from another client</p>"
          }
        ],
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Error fetching customer</p>"
          },
          {
            "group": "Error 500",
            "optional": false,
            "field": "JwtInternalServerError",
            "description": "<p>Unexpected error verifying JWT token</p>"
          }
        ],
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>'x-access-token' was not provided on request headers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": \"One client cannot query data from another client\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./src/routes/customer.doc.js",
    "groupTitle": "Customer",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/customer"
      }
    ]
  },
  {
    "type": "patch",
    "url": "/customer/address",
    "title": "Insert a new customers's address",
    "name": "PatchCustomerAddress",
    "group": "Customer",
    "version": "0.1.0",
    "permission": [
      {
        "name": "Manager",
        "title": "Manager profile required",
        "description": "<p>This action can only be performed by a user with Manager profile</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.postalCode",
            "description": "<p>The address postal code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Update an existing Customer",
          "content": "{\n  \"cpf\": 95569658076,\n  \"address\": {\n    \"type\": \"HOME\",\n    \"streetName\": \"Rua sem nome\",\n    \"streetNumber\": 12,\n    \"city\": \"Franca\",\n    \"state\": \"SP\",\n    \"postalCode\": 14400000\n  }\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>The JWT token obtained through /user/login</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customer",
            "description": "<p>The customer as it was stored in the database</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer._id",
            "description": "<p>Customer's ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customer.address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address._id",
            "description": "<p>Customer's address ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.postalCode",
            "description": "<p>The address postal code</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId[]",
            "optional": false,
            "field": "customer.customerDocuments",
            "description": "<p>The ObjectId that references this customer's documents</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.account",
            "description": "<p>The ObjectId that references this customer's account</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.user",
            "description": "<p>The ObjectId that references this customer's user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 201 CREATED\n{\n  \"customer\": {\n    \"customerDocuments\": [],\n    \"_id\": \"6063b2e3b9d5917b81cf2731\",\n    \"cpf\": 37976948814,\n    \"name\": \"Thiago Monteiro de Paula\",\n    \"rg\": \"450056752\",\n    \"__v\": 0,\n    \"address\": [\n      {\n        \"_id\": \"60679d9fcadde92b79efa2a8\",\n        \"type\": \"HOME\",\n        \"streetName\": \"Rua Radialista Alfeu Stabelini\",\n        \"streetNumber\": 1234,\n        \"city\": \"Franca\",\n        \"state\": \"SP\",\n        \"postalCode\": \"14412314\"\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Only a manager can update a customer's data</p>"
          }
        ],
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If the request body is missing any required field</p>"
          }
        ],
        "Error 404": [
          {
            "group": "Error 404",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Customer not found</p>"
          }
        ],
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Error updating customer</p>"
          },
          {
            "group": "Error 500",
            "optional": false,
            "field": "JwtInternalServerError",
            "description": "<p>Unexpected error verifying JWT token</p>"
          }
        ],
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>'x-access-token' was not provided on request headers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": \"Only a manager can update a customer's data\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./src/routes/customer.doc.js",
    "groupTitle": "Customer",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/customer/address"
      }
    ]
  },
  {
    "type": "post",
    "url": "/customer",
    "title": "Insert a new Customer",
    "name": "PostCustomer",
    "group": "Customer",
    "version": "0.1.0",
    "permission": [
      {
        "name": "Manager",
        "title": "Manager profile required",
        "description": "<p>This action can only be performed by a user with Manager profile</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": true,
            "field": "address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.postalCode",
            "description": "<p>The address postal code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Insert a new customer",
          "content": "{\n  \"cpf\": 95569658076,\n  \"name\": \"Cliente consumidor\",\n  \"rg\": 3434556645,\n  \"address\": [\n    {\n      \"type\": \"HOME\",\n      \"streetName\": \"Rua sem nome\",\n      \"streetNumber\": 12,\n      \"city\": \"Franca\",\n      \"state\": \"SP\",\n      \"postalCode\": 14400000\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>The JWT token obtained through /user/login</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customer",
            "description": "<p>The customer as it was stored in the database</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer._id",
            "description": "<p>Customer's ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customer.address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address._id",
            "description": "<p>Customer's address ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.postalCode",
            "description": "<p>The address postal code</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId[]",
            "optional": false,
            "field": "customer.customerDocuments",
            "description": "<p>The ObjectId that references this customer's documents</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  \"customer\": {\n    \"customerDocuments\": [],\n    \"_id\": \"6063b2e3b9d5917b81cf2731\",\n    \"cpf\": 37976948814,\n    \"name\": \"Thiago Monteiro de Paula\",\n    \"rg\": \"450056752\",\n    \"__v\": 0,\n    \"address\": [\n      {\n        \"_id\": \"60679d9fcadde92b79efa2a8\",\n        \"type\": \"HOME\",\n        \"streetName\": \"Rua Radialista Alfeu Stabelini\",\n        \"streetNumber\": 1234,\n        \"city\": \"Franca\",\n        \"state\": \"SP\",\n        \"postalCode\": \"14412314\"\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Only a manager can insert new customers</p>"
          }
        ],
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If the request body is missing any required field</p>"
          }
        ],
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Error creating customer</p>"
          },
          {
            "group": "Error 500",
            "optional": false,
            "field": "JwtInternalServerError",
            "description": "<p>Unexpected error verifying JWT token</p>"
          }
        ],
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>'x-access-token' was not provided on request headers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": \"Only a manager can insert new customers\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./src/routes/customer.doc.js",
    "groupTitle": "Customer",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/customer"
      }
    ]
  },
  {
    "type": "put",
    "url": "/customer",
    "title": "Update an existing Customer",
    "name": "PutCustomer",
    "group": "Customer",
    "version": "0.1.0",
    "permission": [
      {
        "name": "Manager",
        "title": "Manager profile required",
        "description": "<p>This action can only be performed by a user with Manager profile</p>"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": true,
            "field": "address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address.postalCode",
            "description": "<p>The address postal code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Update an existing Customer",
          "content": "{\n  \"cpf\": 95569658076,\n  \"name\": \"Cliente consumidor\",\n  \"rg\": 3434556645,\n  \"address\": [\n    {\n      \"type\": \"HOME\",\n      \"streetName\": \"Rua sem nome\",\n      \"streetNumber\": 12,\n      \"city\": \"Franca\",\n      \"state\": \"SP\",\n      \"postalCode\": 14400000\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>The JWT token obtained through /user/login</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "customer",
            "description": "<p>The customer as it was stored in the database</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer._id",
            "description": "<p>Customer's ID on the database</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.cpf",
            "description": "<p>Customer's CPF</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.name",
            "description": "<p>Customer's name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.rg",
            "description": "<p>Customer's RG</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "customer.address",
            "description": "<p>Customer's address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address._id",
            "description": "<p>Customer's address ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.type",
            "description": "<p>Indicates if this is a Home, business, billing or other address type</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.streetName",
            "description": "<p>The street name</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "customer.address.streetNumber",
            "description": "<p>The street number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.city",
            "description": "<p>City name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.state",
            "description": "<p>State or province</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "customer.address.postalCode",
            "description": "<p>The address postal code</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId[]",
            "optional": false,
            "field": "customer.customerDocuments",
            "description": "<p>The ObjectId that references this customer's documents</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.account",
            "description": "<p>The ObjectId that references this customer's account</p>"
          },
          {
            "group": "Success 200",
            "type": "ObjectId",
            "optional": false,
            "field": "customer.user",
            "description": "<p>The ObjectId that references this customer's user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  \"customer\": {\n    \"customerDocuments\": [],\n    \"_id\": \"6063b2e3b9d5917b81cf2731\",\n    \"cpf\": 37976948814,\n    \"name\": \"Thiago Monteiro de Paula\",\n    \"rg\": \"450056752\",\n    \"__v\": 0,\n    \"address\": [\n      {\n        \"_id\": \"60679d9fcadde92b79efa2a8\",\n        \"type\": \"HOME\",\n        \"streetName\": \"Rua Radialista Alfeu Stabelini\",\n        \"streetNumber\": 1234,\n        \"city\": \"Franca\",\n        \"state\": \"SP\",\n        \"postalCode\": \"14412314\"\n      }\n    ]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Only a manager can update a customer's data</p>"
          }
        ],
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If the request body is missing any required field</p>"
          }
        ],
        "Error 404": [
          {
            "group": "Error 404",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Customer not found</p>"
          }
        ],
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Error updating customer</p>"
          },
          {
            "group": "Error 500",
            "optional": false,
            "field": "JwtInternalServerError",
            "description": "<p>Unexpected error verifying JWT token</p>"
          }
        ],
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>'x-access-token' was not provided on request headers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  \"error\": \"Only a manager can update a customer's data\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./src/routes/customer.doc.js",
    "groupTitle": "Customer",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/customer"
      }
    ]
  }
] });
