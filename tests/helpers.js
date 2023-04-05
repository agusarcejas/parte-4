const supertest = require('supertest')
const { app } = require('../index')

const api = supertest(app)

const initialPersons = [
  {
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  }
]

const getAllNamePersons = async () => {
  const response = await api.get('/api/persons')
  return response.body.map(r => r.name)
}

module.exports = {
  getAllNamePersons,
  api,
  initialPersons
}
