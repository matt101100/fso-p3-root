const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

morgan.token('body', (req) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/info', (request, response) => {
    const numPersons = persons.length
    response.send(`<p>Phonebook has info for ${numPersons} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const personToDisplay = persons.find(person => person.id === id)

    if (personToDisplay) {
        // display if the person with id exists
        response.json(personToDisplay)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateUniqueId = (persons) => {
    let uniqueId
    const existingIds = new Set(persons.map(person => person.id))

    do {
        uniqueId = Math.floor((Math.random() * 10000)).toString()
    } while (existingIds.has(uniqueId))

    return uniqueId
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name){
        return response.status(400).json({
            error: 'Contact name missing.'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: "Contact number missing."
        })
    } else if (persons.some(person => person.name === body.name)) {
        // reject if the specified name already exists
        return response.status(400).json({
            error: "Contact already exists in phonebook."
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateUniqueId(persons)
    }

    persons = persons.concat(person)
    response.json(person)
})

app.use(morgan())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})