export default class dotenvSafe {
  static config () {
    process.env.MONGODB_URI = 'not defined'
    process.env.PORT = '3002'
    process.env.ADMIN_USER_PASSWORD = '123456'
    process.env.JWT_SECRET = '$Ch@l3ng3N0d3b@4s$'
    process.env.JWT_EXPIRITY_TIME = '604800'
    return process.env
  }
}
