const express = require('express')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(bodyParser.json())
app.use(cors())

const uri = process.env.DB_URI
const port = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.send("hello from server, it's working!")
})

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
client.connect(err => {
  if (!err) {
    console.log('database connected successfully')
    const booksCollection = client.db('amazingbooks').collection('books')
    const studentsCollection = client.db('amazingbooks').collection('students')

    // Book Routes
    app.post('/insert-books', async (req, res) => {
      const books = req.body
      try {
        const response = await booksCollection.insertMany(books.books)
        res.status(200).json({
          message: 'Successfully inserted books',
          counts: response.insertedCount
        })
      } catch (error) {
        res.status(500).json({ error, message: error.message })
      }
    })
    app.get('/get-books', (req, res) => {
      try {
        booksCollection
          .find()
          .toArray((err, result) =>
            err
              ? res.status(404).json({ error: err, message: 'No Book Found' })
              : res.status(200).send(result)
          )
      } catch (error) {
        res.status(404).json({ error, message: 'No Book Found' })
      }
    })
    app.get('/get-book/:book', async (req, res) => {
      const book = req.params.book
      try {
        booksCollection
          .find({ name: book })
          .toArray((err, result) =>
            err
              ? res.status(404).json({ error: err, message: 'No Book Found' })
              : res.status(200).send(result)
          )
      } catch (error) {
        res.status(404).json({ error, message: 'No Book Found' })
      }
    })
    app.post('/update-book', async (req, res) => {
      const { _id, name, author } = req.body
      try {
        const response = await booksCollection.updateOne(
          { _id: ObjectId(_id) },
          {
            $set: {
              name,
              author
            }
          }
        )
        res.status(200).json({ message: 'Book updated successfully' })
      } catch (error) {
        res.status(500).json({ error, message: 'Failed to update the book' })
      }
    })

    // Student Routes
    app.post('/insert-students', async (req, res) => {
      const students = req.body
      try {
        const response = await studentsCollection.insertMany(students.students)
        res.status(200).json({
          message: 'Successfully inserted students',
          counts: response.insertedCount
        })
      } catch (error) {
        res.status(500).json({ error, message: error.message })
      }
    })
    app.get('/get-students', async (req, res) => {
      try {
        studentsCollection
          .find()
          .toArray((err, result) =>
            err
              ? res
                  .status(404)
                  .json({ error: err, message: 'No Student Found' })
              : res.status(200).send(result)
          )
      } catch (error) {
        res.status(404).json({ error, message: 'No Student Found' })
      }
    })
    app.get('/get-student/:student', async (req, res) => {
      const student = req.params.student
      try {
        studentsCollection
          .find({ firstname: student })
          .toArray((err, result) =>
            err
              ? res
                  .status(404)
                  .json({ error: err, message: 'No Student Found' })
              : res.status(200).send(result)
          )
      } catch (error) {
        res.status(404).json({ error, message: 'No Student Found' })
      }
    })
    app.post('/update-student', async (req, res) => {
      const { _id, firstname, lastname } = req.body
      try {
        const response = await studentsCollection.updateOne(
          { _id: ObjectId(_id) },
          {
            $set: {
              firstname,
              lastname
            }
          }
        )
        res.status(200).json({ message: 'Student updated successfully' })
      } catch (error) {
        res.status(500).json({ error, message: 'Failed to update the student' })
      }
    })
  } else console.log(err)
})

app.listen(process.env.PORT || port, () =>
  console.log(`App is running on port=${port}`)
)
