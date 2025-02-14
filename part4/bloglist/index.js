import express from "express"
const app = express()
import cors from "cors"
import mongoose from "mongoose"
import Blog from './models/blog.js'

//const Blog = mongoose.model('Blog', blogSchema)

const Url = process.env.mongoUrl
mongoose.connect(Url)

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})