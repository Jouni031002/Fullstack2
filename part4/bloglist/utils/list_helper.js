const Blog = require('../models/blog')

const dummy = (blogs) => {
    return 1
  }
  
//   module.exports = {
//     dummy
//   }

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, blog) => accumulator + blog.likes, 0)
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

//export default {dummy, totalLikes}
module.exports = {dummy, totalLikes, blogsInDb}