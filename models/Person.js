const { Schema, model } = require('mongoose')

const personSchema = new Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    // Elimino campos extra que no interesan
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = model('Person', personSchema)

/* const person = new Person({
  name: 'sdgsdgdsg',
  number: '1234'
})

person.save()
  .then(result => {
    console.log(result)
    mongoose.connection.close()
  })
  .catch(err => {
    console.error(err)
  })

  Person.find({})
  .then(result => {
    console.log(result)
    mongoose.connection.close()
  }) */

module.exports = Person
