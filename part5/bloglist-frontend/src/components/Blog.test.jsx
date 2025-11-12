/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import BlogForm from './BlogForm'

test('renders title and author', () => {
  const blog = {
    title: 'testiblogi',
    author: 'author toimii',
    url: 'url toimii',
    likes: 3,
    user: { name: 'Test User', username: 'testuser' }
  }

  render(<Blog blog={blog} user={{ username: 'testuser' }} />)

  expect(screen.getByText('testiblogi')).toBeDefined()
  expect(screen.getByText('author toimii')).toBeDefined()

  expect(screen.queryByText('url toimii')).toBeNull()
  expect(screen.queryByText('likes 3')).toBeNull()
})

test('renders url, likes and user when view-button is pressed', async () => {
  const blog = {
    title: 'testiblogi',
    author: 'author toimii',
    url: 'http://example.com',
    likes: 7,
    user: {
      name: 'Testikäyttäjä',
      username: 'testuser'
    }
  }

  const user = {
    username: 'testuser',
    name: 'Testikäyttäjä'
  }

  const userSim = userEvent.setup()

  render(<Blog blog={blog} user={user} />)

  const viewButton = screen.getByText('view')
  await userSim.click(viewButton)

  expect(screen.getByText('http://example.com')).toBeDefined()
  expect(screen.getByText('likes 7')).toBeDefined()
  expect(screen.getByText('Testikäyttäjä')).toBeDefined()

})

test ('makes sure eventhandler is called twice when like button is pressed twice', async () => {
  const blog = {
    title: 'testiblogi',
    author: 'author toimii',
    url: 'http://example.com',
    likes: 0,
    user: {
      name: 'Testikäyttäjä',
      username: 'testuser'
    }
  }

  const user = {
    username: 'testuser',
    name: 'Testikäyttäjä'
  }

  const mockHandler = vi.fn()

  const userSim = userEvent.setup()

  render(<Blog blog={blog} user={user} onLike={mockHandler} />)

  const viewButton = screen.getByText('view')
  await userSim.click(viewButton)

  const likeButton = screen.getByText('like')
  await userSim.click(likeButton)
  await userSim.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})

test('provides createBlog with correct data', async () => {
  const create = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={create} />)

  const titleInput = screen.getByRole('textbox', { name: /title/i })
  const authorInput = screen.getByRole('textbox', { name: /author/i })
  const urlInput = screen.getByRole('textbox', { name: /url/i })
  const createButton = screen.getByRole('button', { name: /create/i })

  await user.type(titleInput, 'Testiblogi')
  await user.type(authorInput, 'Testaaja')
  await user.type(urlInput, 'http://testiblogi.fi')

  await user.click(createButton)

  expect(create).toHaveBeenCalledTimes(1)

  expect(create).toHaveBeenCalledWith({
    title: 'Testiblogi',
    author: 'Testaaja',
    url: 'http://testiblogi.fi',
    likes: 0
  })

})