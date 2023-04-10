const moongose = require('mongoose')
const Person = require('../models/Person')
const { server } = require('../index')
const { api, initialPersons, getAllNamePersons } = require('./helpers')

beforeEach(async () => {
  await Person.deleteMany({})

  // Forma secuencial de obtener todas las personas de initialPersons y que pueda añadir cuatas personas quiera
  for (const person of initialPersons) {
    const newPerson = new Person(person)
    await newPerson.save()
  }
})

test('persons are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/persons')
  expect(response.body).toHaveLength(initialPersons.length)
})

test('the first note is about Arto Hellas', async () => {
  const { names } = await getAllNamePersons()
  expect(names).toContain('Arto Hellas')
})

test('a valid person can be added', async () => {
  const newPerson = {
    name: 'Matti Luukkainen',
    number: '040-123456'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { names } = await getAllNamePersons()
  expect(names).toContain('Matti Luukkainen')
})

test('a person without name is not added', async () => {
  const newPerson = {
    number: '040-123456'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  const response = await api.get('/api/persons')
  expect(response.body).toHaveLength(initialPersons.length)
})

test('a person can be deleted', async () => {
  const { response: firstResponse } = await getAllNamePersons()
  const { body: persons } = firstResponse
  const personsToDelete = persons[0]

  await api
    .delete(`/api/persons/${personsToDelete.id}`)
    .expect(204)

  const { names, response: secondResponse } = await getAllNamePersons()

  expect(secondResponse.body).toHaveLength(initialPersons.length - 1)

  expect(names).not.toContain(personsToDelete.name)
})

test('a person that do not exist can not be deleted', async () => {
  await api
    .delete('/api/persons/1234')
    .expect(400)

  const { response } = await getAllNamePersons()

  expect(response.body).toHaveLength(initialPersons.length)
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
