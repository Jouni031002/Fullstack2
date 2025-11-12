// const Blog = ({ blog }) => (
//   <div>
//     {blog.title} {blog.author}
//   </div>
// )

// export default Blog

import { useState } from 'react'

const Blog = ({ blog, onLike, onDelete, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLikeClick = () => {
    onLike(blog)
  }

  return (
    <div style={{ border: '1px solid black', padding: 10, marginBottom: 10 }} className='blog'>
      <div>
        <span>{blog.title}</span> <span>{blog.author}</span>
         <button style={{marginLeft: 5}} onClick={toggleVisibility}>
           {visible ? 'hide' : 'view'}
         </button>
      </div>

      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>likes {blog.likes} <button onClick={handleLikeClick}>like</button></div>
          <div>{blog.user.name}</div>
          {user && blog.user && user.username === blog.user.username && (
            <button onClick={() => onDelete(blog)}>delete</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog