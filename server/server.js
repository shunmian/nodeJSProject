const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { ObjectID } = require('mongodb')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } = require('./middleware/authenticate')


const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  const newTodo = new Todo({
    text: req.body.text
  })
  newTodo.save().then(doc=>{
    res.status(200).send(doc)
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.get('/todos', (req, res) => {
  Todo.find().then(todos=>{
    res.send(todos)
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.get('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('invalid id format')
  }
  Todo.findById(id).then(doc=>{
    if(!doc){
      res.status(404).send('id not existed')
    } else {
      res.status(200).send(doc)
    }
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('invalid id format')
  }
  Todo.findByIdAndRemove(id).then(doc=>{
    if(!doc){
      res.status(404).send('id not existed')
    } else {
      res.status(200).send(doc)
    }
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params
  const body = _.pick(req.body, ['text', 'completed'])
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('invalid id format')
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findByIdAndUpdate(id,
    {
      $set: body
    },
    {
      new: true
    }
  ).then(doc => {
    if(!doc){
      res.status(404).send('id not existed')
    } else {
      res.status(200).send(doc)
    }
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const newUser = new User(body)
  newUser.save().then(()=>{
    return newUser.generateAuthToken()
  }).then(token=>{
    res.header('x-auth', token).send(newUser)
  }).catch(e=>{
    res.status(400).send(e)
  })
})

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  User.findByCredential(body.email, body.password).then(user => {
    const token = user.tokens[0].token
    if(!token) {
      return Promise.reject()
    }
    return Promise.resolve(token).then(token=>{
    res.header('x-auth', token).send(user)
    })
  }).catch(e => {
    res.status(400).send()
  })
})



app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})


app.listen(port, () => {
  console.log(`Server is up on part ${port}`)
})

module.exports.app = app

















