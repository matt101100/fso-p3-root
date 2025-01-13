const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// display simple phonebook overview
app.get('/api/info', (request, response, next) => {
    Person.find()
    .then(personEntry => {
        response.send(`Phonebook has info for ${personEntry.length} people.\n ${Date()}`)
    })
    .catch(error => next(error))
})

// get all persons in phonebook in JSON format
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        if (persons) {
            response.json(persons)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

// get single person in JSON format
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const personToDisplay = Person.findById(id)
    .then(person => {
        if (person) {
            // display if the person with id exists
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

// delete single person from phonebook
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

// helper to generate a unique id in range
const generateUniqueId = (persons) => {
    let uniqueId
    const existingIds = new Set(persons.map(person => person.id))

    do {
        uniqueId = Math.floor((Math.random() * 10000)).toString()
    } while (existingIds.has(uniqueId))

    return uniqueId
}

// add single new contact to phonebook
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

// update existing contact information
app.put('/api/persons/:id', (request, response, next) => {
    const [name, number] = request.body
  
    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
    
})

app.use(morgan())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'invalid id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})