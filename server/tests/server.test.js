const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const newTodos = [
  {
    _id: new ObjectID(),
    text: 'first todo'
  },
  {
    _id: new ObjectID(),
    text: 'second todo'
  }
]
beforeEach(done=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(newTodos)
  }).then(()=>done())
})

describe('POST /todos', () => {
  it('should create a new todo', (done)=>{
    const text = 'Eat big dinner'
    request(app).post('/todos')
    .send({ text })
    .expect(200)
    .expect(res => {
      expect(res.body.text).toBe(text)
    })
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      Todo.find().then(todos=>{
        expect(todos.length).toBe(3)
        expect(todos[todos.length-1].text).toBe(text)
        done()
      }).catch(e=>done(e))
    })
  })
  
  it('should not create a new todo', (done)=>{
    const text = ''
    request(app).post('/todos')
    .send({ text })
    .expect(400)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      Todo.find().then(todos=>{
        expect(todos.length).toBe(2)
        done()
      }).catch(e=>done(e))
    })
  })
})

describe('GET /todos', () => {
  it('should return todos', (done)=>{
    request(app).get('/todos')
    .expect(200)
    .expect(res => {
      expect(res.body.length).toBe(2)
    })
    .end(done)
  })
})


describe('GET /todos/:id', () => {
  it('should return correct todo with valid id', (done)=>{
    const aTodo = newTodos[0]
    request(app).get(`/todos/${aTodo._id}`)
    .expect(200)
    .expect(res => {
      expect(res.body.text).toBe(aTodo.text)
    })
    .end(done)
  })

  it('should return 404 with invalid id', (done)=>{
    const aTodo = newTodos[0]
    request(app).get(`/todos/${aTodo._id}1`)
    .expect(404)
    .end(done)
  })

  it('should return 404 if not found', (done)=>{
    const aTodo = newTodos[0]
    request(app).get(`/todos/${new ObjectID()}`)
    .expect(404)
    .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done)=>{
    const aTodo = newTodos[0]
    request(app).delete(`/todos/${aTodo._id}`)
    .expect(200)
    .expect(res => {
      expect(res.body.text).toBe(aTodo.text)
    })
    .end((err, res)=>{
      if(err){
        return done()
      }
      Todo.findById(aTodo._id).then(doc=>{
        expect(doc).toBeNull()
        return done()
      }).catch(e=>done(e))
    })
  })

  it('should return 404 with invalid id', (done)=>{
    const aTodo = newTodos[0]
    request(app).delete(`/todos/${aTodo._id}1`)
    .expect(404)
    .end(done)
  })

  it('should return 404 if not found', (done)=>{
    const aTodo = newTodos[0]
    request(app).delete(`/todos/${new ObjectID()}`)
    .expect(404)
    .end(done)
  })
})