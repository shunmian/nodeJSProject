const expect = require('expect')
const request = require('supertest')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const newTodos = [
  {
    text: 'first todo'
  },
  {
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