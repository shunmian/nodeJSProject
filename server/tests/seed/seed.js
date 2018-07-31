const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo } = require('./../../models/todo')
const { User } = require('./../../models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const newUsers = [
  {
    _id: userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc123').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
  }
]

const populateUsers = done =>{
  User.remove({}).then(()=>{
    const userOnePromise = new User(newUsers[0]).save()
    const userTwoPromise = new User(newUsers[1]).save()
    return Promise.all([userOnePromise, userTwoPromise])
  }).then(()=>done())
}


const newTodos = [
  {
    _id: new ObjectID(),
    text: 'first todo'
  },
  {
    _id: new ObjectID(),
    text: 'second todo',
    completed: true,
    completedAt: 333
  }
]

const populateTodos = done =>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(newTodos)
  }).then(()=>done())
}


module.exports = {
  newTodos,
  newUsers,
  populateTodos,
  populateUsers
}
