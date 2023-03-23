const express = require('express')
const cors = require('cors')
const logger = require('./loggerMiddlewares')
const morgan = require('morgan')
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

let persons = [
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  },
  {
    name: 'qwetwqt',
    number: '56789',
    id: 10
  },
  {
    name: 'shsjgfdjg',
    number: '1242151',
    id: 12
  },
  {
    name: 'sdfafas',
    number: '457458458',
    id: 13
  },
  {
    name: 'hjlhjlñhñ',
    number: '235325',
    id: 14
  },
  {
    name: 'dfjfdjdfjfdj',
    number: '1234',
    id: 15
  },
  {
    name: 'dfhfdhfdh',
    number: '436436',
    id: 17
  },
  {
    name: 'fgjgfjfg',
    number: '124535',
    id: 18
  },
  {
    name: 'arto hellas',
    number: '1234',
    id: 20
  },
  {
    name: 'lean cejas',
    number: '432624',
    id: 21
  },
  {
    name: 'f',
    number: '1246436',
    id: 24
  },
  {
    name: 'z',
    number: '12345',
    id: 25
  },
  {
    name: 'h',
    number: '1234',
    id: 26
  },
  {
    name: 'abc',
    number: '12345',
    id: 27
  },
  {
    name: 'asdgds',
    number: '21125',
    id: 28
  },
  {
    name: 'gjhgdjgf',
    number: '346346',
    id: 29
  },
  {
    name: 'av',
    number: '52125',
    id: 30
  },
  {
    name: 'sadfsfa',
    number: '24154',
    id: 31
  },
  {
    name: 'jglkgjl',
    number: '6598569',
    id: 32
  },
  {
    name: 'fgkjfkgf',
    number: '54757',
    id: 33
  },
  {
    name: 'fdghfdjhfdh',
    number: '436346',
    id: 34
  },
  {
    name: 'fdgdfgfdgdfgdfgdfgfdh',
    number: '4363464564',
    id: 35
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

// Informacion acerca de la cantidad de personas y la fecha y horario de consulta

app.get('/info', (request, response) => {
  const fechaActual = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people </p> <p>${fechaActual}</p>`)
})

// Obtener todas las personas

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// Obtener una persona

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(persons => persons.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// Eliminar una persona

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = request.body

  const ids = persons.map(person => person.id)
  const maxID = Math.max(...ids)

  const newPerson = {
    id: maxID + 1,
    name: person.name,
    number: person.number
  }

  const names = persons.map(person => person.name)
  const nombreEnArray = names.includes(newPerson.name)

  if (nombreEnArray || newPerson.name === '' || newPerson.number === '') {
    return response.status(406).json({ error: 'Falta informacion o ya existe esa persona' })
  }

  persons = [...persons, newPerson]

  response.status(201).json(newPerson)
})

app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found'
  })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
