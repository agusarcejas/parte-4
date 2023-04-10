// Conexion a la base de datos
require('dotenv').config() // Lee el archivo .env
require('./mongo.js')

const express = require('express')
const cors = require('cors')
const Person = require('./models/Person.js')
const morgan = require('morgan')
const logger = require('./loggerMiddlewares')
const notFound = require('./middleware/notFound.js')
const handleError = require('./middleware/handleError.js')
const app = express()

app.use(express.json())
app.use(cors())
app.use(logger)

// Mensaje del servidor de la solicitud con Morgan

morgan.token('apiData', (req, res) => {
  return JSON.stringify(res.locals.apiData)
})

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

// EL ORDEN DE LOS MIDDLEWARES IMPORTA

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

// Informacion acerca de la cantidad de personas y la fecha y horario de consulta

app.get('/info', (request, response) => {
  const fechaActual = new Date()
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people </p> <p>${fechaActual}</p>`)
  })
})

// Obtener todas las personas

app.get('/api/persons', async (request, response) => {
  const persons = await Person.find({})
  response.json(persons)
})

// Obtener una persona de la base de datos

app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params

  Person.findById(id).then(person => {
    if (person) {
      return response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(err => { next(err) })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const person = request.body

  const newPerson = {
    name: person.name,
    number: person.number
  }

  Person.findByIdAndUpdate(id, newPerson, { new: true })
    .then(result => {
      response.json(result)
    })
})

// Eliminar una persona de la base de datos

app.delete('/api/persons/:id', async (request, response, next) => {
  const { id } = request.params
  await Person.findByIdAndDelete(id)
  response.status(204).end()
})

// Añadir una persona a la base de datos

app.post('/api/persons', async (request, response, next) => {
  const person = request.body

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  if (!newPerson.name || newPerson.name === '' || !newPerson.number || newPerson.number === '') {
    return response.status(400).json({ error: 'Faltan completar campos' })
  } else {
    // Busco si ya existe una persona con el mismo nombre
    const result = await Person.findOne({ name: newPerson.name })
    if (result !== null) {
      return response.status(400).json({ error: 'Ya existe esa persona' })
    } else {
      try {
        const savedPerson = await newPerson.save()
        response.status(201).json(savedPerson)
      } catch (error) {
        next(error)
      }
    }
  }
})

// ERROR

app.use(notFound)

app.use(handleError)

// Conexion a puerto

const port = process.env.PORT
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

module.exports = { app, server }
