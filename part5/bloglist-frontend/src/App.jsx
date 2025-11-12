import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  //const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(null)
  // const [newBlog, setNewBlog] = useState({
  //   title: '',
  //   author: '',
  //   url: ''
  // })

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogger')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogger', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification(`Welcome ${user.name}`)
    } catch {
      showNotification('wrong username or password')
    }
  }

  // const handleBlogChange = event => {
  //   const { name, value } = event.target
  //   setNewBlog({
  //     ...newBlog,
  //     [name]: value
  //   })
  // }

  const showNotification = (message, duration = 5000) => {
  setNotification(message)
  setTimeout(() => {
    setNotification(null)
  }, duration)
}

//   const blogForm = () => (
//   <form onSubmit={addBlog}>
//     <div>
//       title:<input name="title" value={newBlog.title} onChange={handleBlogChange} />
//     </div>
//     <div>
//       author:<input name="author" value={newBlog.author} onChange={handleBlogChange}/>
//     </div>
//     <div>
//       url:<input name="url" value={newBlog.url} onChange={handleBlogChange} />
//     </div>
//     <button type="submit">create</button>
//   </form>
// )

const blogForm = () => (
  <Togglable buttonLabel="create new blog">
    <BlogForm
      createBlog={addBlog}
    />
  </Togglable>
)

  // const addBlog = event => {
  //   event.preventDefault()
  //   const blogObject = {
  //     title: newBlog.title,
  //     author: newBlog.author,
  //     url: newBlog.url,
  //     likes: 0
  //   }

  //   blogService.create(blogObject).then(returnedBlog => {
  //     setBlogs(blogs.concat(returnedBlog))
  //     showNotification(`new blog added: ${returnedBlog.title} by ${returnedBlog.author}`)
  //     setNewBlog({
  //       title: "",
  //       author: "",
  //       url: ""
  //     })
  //   })
  // }

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        showNotification(`new blog added: ${returnedBlog.title} by ${returnedBlog.author}`)
      })
  }

  const handleLike = async (blogToUpdate) => {
  const updatedBlog = {
    ...blogToUpdate,
    user: blogToUpdate.user.id || blogToUpdate.user,
    likes: blogToUpdate.likes + 1
  }

  try {
    const returnedBlog = await blogService.update(blogToUpdate.id, updatedBlog)

    setBlogs(blogs.map(blog =>
  blog.id === returnedBlog.id
    ? { ...returnedBlog, user: blogToUpdate.user }
    : blog
    ))
  } catch (error) {
    console.error('Error updating blog likes:', error)
  }
}

const handleDelete = async (blogToDelete) => {
  const confirmDelete = window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`)
  if (!confirmDelete) return

  try {
    await blogService.remove(blogToDelete.id)
    setBlogs(blogs.filter(blog => blog.id !== blogToDelete.id))
    showNotification(`Deleted blog: ${blogToDelete.title}`)
  } catch (error) {
    console.error('Error deleting blog:', error)
    showNotification('Failed to delete the blog')
  }
}


  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogger')
    setUser(null)
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification} />
        <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>{user.name} logged in <button type="button" onClick={handleLogout}>logout</button></p>
      <h2>create new</h2>
      {blogForm()}
      {blogs
      .sort((a, b) => b.likes - a.likes)
      .map(blog =>
        <Blog key={blog.id} blog={blog} onLike={handleLike} onDelete={handleDelete} user={user}/>
      )}
    </div>
  )

}

export default App