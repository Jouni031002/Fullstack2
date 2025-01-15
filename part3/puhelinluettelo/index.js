import express from "express"
//const morgan = require('morgan')
import morgan from "morgan"
const app = express()
//const cors = require('cors')
import cors from "cors"
import mongoose from "mongoose"
import Person from './models/person.js'
app.use(cors())
app.use(morgan('tiny'))
app.use(express.static('dist'))



let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

  app.get('/info', (request, response) => {
    let ct = new Date()
    const info = `<p>Phonebook has info for ${persons.length} people</p> <p>${ct}</p>`
    response.send(info)
  })

  // app.get('/api/persons/:id', (request, response) => {
  //   Person.findById(request.params.id).then(person => {
  //     response.json(person)
  //   })
  // })

  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

  // app.delete('/api/persons/:id', (request, response) => {
  //   const id = request.params.id
  //   persons = persons.filter(person => person.id !== id)
  
  //   response.status(204).end()
  // })

  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  const generateId = () => {
    return Math.floor(Math.random() * 10000000000)
  }

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (body.name === undefined) {
      return response.status(400).json({ error: 'name missing' })
    }

    if (body.number === undefined) {
      return response.status(400).json({ error: 'number missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

  // app.post('/api/persons', (request, response) => {
  //   console.log(request.headers)
  //   const body = request.body

  //   if (!body.name){
  //       return response.status(400).json({
  //           error: 'name missing'
  //       })
  //   }

  //   if (!body.number){
  //       return response.status(400).json({
  //           error: 'number missing'
  //       })
  //   }

  //   const tyyppi = persons.find(person => person.name === body.name)
  //   if (tyyppi) {
  //       return response.status(400).json({
  //           error: 'name must be unique'
  //       })
  //   }


  //   const person = {
  //     name: body.name,
  //     number: body.number,
  //     id: generateId(),
  //   }
  
  //   persons = persons.concat(person)
  
  //   response.json(person)
  // })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
  }
  
  app.use(errorHandler)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })