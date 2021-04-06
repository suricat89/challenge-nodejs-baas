import mongoose from 'mongoose'

export default {
  mongoose,
  connect: () => {
    mongoose.Promise = Promise
    return mongoose.connect(process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
  },
  disconnect: done => {
    mongoose.disconnect(done)
  }
}
