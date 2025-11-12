//import Blog from '../models/blog.js'
//import express from "express"
const jwt = require('jsonwebtoken')
const { request, response } = require('../app.js')
const Blog = require('../models/blog.js')
const express = require('express')
const User = require('../models/user.js')

const BlogRouter = require('express').Router()

BlogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

BlogRouter.get('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// BlogRouter.post('/', (request, response) => {
//   const blog = new Blog(request.body)

//   blog
//     .save()
//     .then(result => {
//       response.status(201).json(result)
//     })
// })

BlogRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedTOken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedTOken.id) {
    return response.status(401).json({error: 'token invalid'
    })
  }
  const user = await User.findById(decodedTOken.id)

  if (!user) {
    return response.status(400).json({error: 'UserId missing or not valid'})
  }

  const blog = new Blog({
    title: body.title, 
    author: body.author,
    url: body.url, 
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
  response.status(201).json(populatedBlog)
})

BlogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

BlogRouter.put('/:id', async (request, response) => {
  const {title, url, author, likes, user} = request.body

  Blog.findById(request.params.id)
    .then((blog) => {
      if (!blog) {
        return response.status(404).end()
      }
      
      blog.title = title
      blog.url = url
      blog.author = author
      blog.likes = likes
      blog.user = user

      return blog.save().then((updatedBlog) => {
        response.json(updatedBlog)
      })
    })
})

module.exports = BlogRouter
