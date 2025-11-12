//import express from "express"
//import cors from "cors"
//import mongoose from "mongoose"
//import Blog from './models/blog.js'
//import BlogRouter from "./controllers/blogs.js"

require('express-async-errors')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const BlogRouter = require('./controllers/blogs')
const UserRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const app = express()
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const config = require('./utils/config')

logger.info('connecting to', config.MONGODB_URI)


//const Blog = mongoose.model('Blog', blogSchema)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use('/api/blogs', BlogRouter)
app.use('/api/users', UserRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)
app.use(middleware.requestLogger)



//export default app
module.exports = app