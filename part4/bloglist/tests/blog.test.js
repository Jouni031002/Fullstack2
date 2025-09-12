// const { test, describe } = require('node:test')
// const assert = require('node:assert')
//import test, {describe} from 'node:test'
//import assert from 'node:assert'
//import listHelper from '../utils/list_helper.js'
const assert = require('node:assert')
const listHelper = require('../utils/list_helper.js')
const {test, after, beforeEach} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const blog = require('../models/blog.js')
const api = supertest(app)

const initialBlog = {
  title: 'Testiblogi',
  author: 'Kirjoittaja',
  url: 'http://example.com',
  likes: 5
}



test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog added', async () => {
  const example = {
    title: "title",
    author: "author",
    url: "url",
    likes: 1
  }

  const response = await api.get('/api/blogs')

  const startLength = response.body.length

  await api
    .post('/api/blogs')
    .send(example)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response2 = await api.get('/api/blogs')
    
  endLength = response2.body.length
  assert.strictEqual(endLength, startLength + 1)
})

test('blog objects have id property instead of _id', async () => {
  const response = await api.get('/api/blogs')
  
  const blogs = response.body

  blogs.forEach(blog => {
    // expect(blog.id).toBeDefined()      
    // expect(blog._id).toBeUndefined()
       assert.ok(blog.id !== undefined)
       assert.ok(blog._id == undefined)   
  })
})

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

test('deleted successfully', async () => {
  const newBlog = {
    title: "title",
    author: "author",
    url: "some url",
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
  const response = await api
    .get('/api/blogs')

  const blogsBefore = response.body.length
  const blogToDelete = response.body[0].id
  

  await api
    .delete('/api/blogs/' + blogToDelete)
    .expect(204)

  const blogsAtEnd = await listHelper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsBefore - 1)

})

test('likes updated successfully', async () => {
  const newBlog = {
    title: "title",
    author: "author",
    url: "some url",
    likes: 9
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogsBefore = await listHelper.blogsInDb()
  console.log(blogsBefore[0].likes)
  const blogToAlter = blogsBefore[(blogsBefore.length-1)]
  console.log(blogToAlter.likes)
  const likesBefore = blogToAlter.likes

  const alteredBlog = newBlog
  alteredBlog.likes++
  console.log(alteredBlog.likes)

  await api
    .put('/api/blogs/' + blogToAlter.id)
    .send(alteredBlog)
    .expect(200)

  const blogsNow = await listHelper.blogsInDb()
  const likesNow = blogsNow[(blogsNow.length - 1)].likes

  assert.strictEqual(likesBefore, likesNow - 1)
  
})

test('when list has only one blog equals the likes of that', () => {
  const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    }  
  ]

  const result = listHelper.totalLikes(blogs)
  assert.strictEqual(result, 36)
})

after(async () => {
  await mongoose.connection.close()
})