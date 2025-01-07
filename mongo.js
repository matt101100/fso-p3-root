const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log("Supply password as argument.")
    process.exit(1)
}

// parse person information as new contact for phonebook

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.x1vkb.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)
if (process.argv.length == 3) {
    // print contact information of all people in phonebook
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
    return
}

// parse contact information and add person to phonebook
const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
})

person.save().then(result => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
})