'use strict'
import app from '../app'
import debugLib from 'debug'
import http from 'http'
import mongoDb from '../mongoDb'
const debug = debugLib('express-generator-api:server')

mongoDb.connect()

const port = process.env.PORT || '3000'
app.set('port', port)
const server = http.createServer(app)
server.listen(port)

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.debug('Listening on ' + bind)
}

const onClose = () => {
  mongoDb.disconnect()
}

server.on('error', onError)
server.on('listening', onListening)
server.on('close', onClose)
