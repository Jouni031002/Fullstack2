const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {

    await request.post('http://localhost:3001/api/testing/reset')

    
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'nimi',
        username: 'nimi',
        password: 'salaisuus'
      }
    })

    
    await page.context().clearCookies()
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
  })

  describe('Login', () => {
    test('user can log in', async ({ page }) => {
      await page.getByLabel('username').fill('nimi')
      await page.getByLabel('password').fill('salaisuus')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('nimi logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByLabel('username').fill('wrong')
      await page.getByLabel('password').fill('nope')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('nimi')
      await page.getByLabel('password').fill('salaisuus')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('miau')
      await page.getByLabel('author:').fill('kissa')
      await page.getByLabel('url:').fill('urli')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('new blog added: miau by kissa')).toBeVisible()
    })

    test('blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('miau')
      await page.getByLabel('author:').fill('kissa')
      await page.getByLabel('url:').fill('urli')
      await page.getByRole('button', { name: 'create' }).click()

      const blog = page.locator('.blog', { hasText: 'miau' })
      await blog.getByRole('button', { name: 'view' }).click()

      const likesText = blog.getByText(/likes\s*\d+/i)
      await expect(likesText).toContainText('likes 0')

      await blog.getByRole('button', { name: 'like' }).click()
      await expect(likesText).toContainText('likes 1')
    })

    test('user can delete their own blog', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('miau')
      await page.getByLabel('author:').fill('kissa2')
      await page.getByLabel('url:').fill('urli')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('miau kissa2')).toBeVisible()

      const blog = page.locator('.blog', { hasText: 'miau kissa2' })
      await expect(blog).toBeVisible()
      await blog.getByRole('button', { name: 'view' }).click()

      page.once('dialog', async dialog => {
        expect(dialog.message()).toMatch("Remove blog miau by kissa2")
        await dialog.accept()
      })

      await blog.getByRole('button', { name: /delete|remove/i }).click()
      await expect(page.getByText('Deleted blog: miau')).toBeVisible()
    })

    test('only the creator sees delete button', async ({ page, request }) => {
     
      await request.post('http://localhost:3001/api/users', {
        data: {
          name: 'toinen',
          username: 'toinen',
          password: 'salaisuus2'
        }
      })

      
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByLabel('title:').fill('BlogiTest')
      await page.getByLabel('author:').fill('AuthorTest')
      await page.getByLabel('url:').fill('http://example.com')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('BlogiTest AuthorTest')).toBeVisible()

      const blog = page.locator('.blog', { hasText: 'BlogiTest' })
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByRole('button', { name: /delete|remove/i })).toBeVisible()

      
      await page.getByRole('button', { name: 'logout' }).click()
      await expect(page.getByRole('button', { name: 'login' })).toBeVisible()

     
      await page.getByLabel('username').fill('toinen')
      await page.getByLabel('password').fill('salaisuus2')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('toinen logged in')).toBeVisible()

      
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByRole('button', { name: /delete|remove/i })).toHaveCount(0)
    })

    test('blogs are ordered by likes, most likes first', async ({ page }) => {
      const blogs = [
        { title: 'Blog A', author: 'Author1', url: 'url1' },
        { title: 'Blog B', author: 'Author2', url: 'url2' },
        { title: 'Blog C', author: 'Author3', url: 'url3' },
      ]

      await page.getByRole('button', { name: 'create new blog' }).click()

      for (const blog of blogs) {
       await page.getByLabel('title:').fill(blog.title)
       await page.getByLabel('author:').fill(blog.author)
       await page.getByLabel('url:').fill(blog.url)
       await page.getByRole('button', { name: 'create' }).click()
     }

      async function likeBlog(title, times) {
        const blog = page.locator('.blog', { hasText: title })
        await blog.getByRole('button', { name: 'view' }).click()
        const likeButton = blog.getByRole('button', { name: 'like' })
        for (let i = 0; i < times; i++) {
          await likeButton.click()
          await page.waitForTimeout(200)
        }
      }

      await likeBlog('Blog A', 1)
      await likeBlog('Blog B', 2)
      await likeBlog('Blog C', 3)

      const blogElements = page.locator('.blog')
      const count = await blogElements.count()
      const blogLikes = []

    for (let i = 0; i < count; i++) {
      const text = await blogElements.nth(i).textContent()
      const match = text.match(/likes\s*(\d+)/i)
      blogLikes.push(match ? Number(match[1]) : 0)
    }

    for (let i = 0; i < blogLikes.length - 1; i++) {
      expect(blogLikes[i]).toBeGreaterThanOrEqual(blogLikes[i + 1])
    }

    const blogTitles = []
    for (let i = 0; i < count; i++) {
      const text = await blogElements.nth(i).textContent()
      const match = text.match(/Blog [A-C]/)
      blogTitles.push(match ? match[0] : '')
    }

    expect(blogTitles).toEqual(['Blog C', 'Blog B', 'Blog A'])
    })
    })
  })
