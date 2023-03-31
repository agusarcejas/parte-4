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

// Informacion acerca de la cantidad de personas y la fecha y horario de consulta

app.get('/info', (request, response) => {
  const fechaActual = new Date()
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people </p> <p>${fechaActual}</p>`)
  })
})

// Obtener todas las personas

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
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

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

// Añadir una persona a la base de datos

app.post('/api/persons', (request, response) => {
  const person = request.body

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  // Busco si ya existe una persona con el mismo nombre
  let personExists = false
  Person.findOne({ name: newPerson.name }).then(result => {
    if (result) {
      personExists = true
    }
  }).finally(() => {
    // Valido si existe la persona o faltan datos
    if (personExists || newPerson.name === '' || newPerson.number === '') {
      return response.status(400).json({ error: 'Falta informacion o ya existe esa persona' })
    } else {
      // Guardo en la base de datos
      newPerson.save().then(savedPerson => {
        response.status(201).json(savedPerson)
      })
    }
  })
})

// ERROR

app.use(notFound)

app.use(handleError)

// Conexion a puerto

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
