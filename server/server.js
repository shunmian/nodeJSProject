const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  console.log("req body", req.body)
  const newTodo = new Todo({
    text: req.body.text
  })
  console.log(newTodo)
  newTodo.save().then(doc=>{
    res.status(201).send(doc)
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.listen(port, () => {
  console.log(`Server is up on part ${port}`)
})

module.exports.app = app

















