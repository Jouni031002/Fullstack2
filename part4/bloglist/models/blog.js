import mongoose from "mongoose"

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

export default mongoose.model('Blog', blogSchema)