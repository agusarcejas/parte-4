const moongose = require('mongoose')
const Person = require('../models/Person')
const { server } = require('../index')
const { api, initialPersons, getAllNamePersons } = require('./helpers')

beforeEach(async () => {
  await Person.deleteMany({})

  const person1 = new Person(initialPersons[0])
  await person1.save()

  const person2 = new Person(initialPersons[1])
  await person2.save()
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
  const names = await getAllNamePersons()
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

  const names = await getAllNamePersons()
  expect(names).toContain('Matti Luukkainen')
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
