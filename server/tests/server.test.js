const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')
const { populateTodos, populateUsers, newTodos, newUsers } = require('./seed/seed')


beforeEach(populateTodos)
beforeEach(populateUsers)

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

describe('PATCH /todos/:id', () => {
  it('should PATCH a todo', (done)=>{
    const aTodo = newTodos[0]
    const text = 'patched first todo'
    request(app).patch(`/todos/${aTodo._id}`)
    .send({text})
    .expect(200)
    .expect(res => {
      expect(res.body.text).toBe(aTodo.text)
    })
    .end((err, res)=>{
      if(err){
        return done()
      }
      Todo.findById(aTodo._id).then(doc=>{
        expect(doc.text).toBe(text)
        return done()
      }).catch(e=>done(e))
    })
  })

  it('should return 404 with invalid id', (done)=>{
    const aTodo = newTodos[0]
    request(app).patch(`/todos/${aTodo._id}1`)
    .expect(404)
    .end(done)
  })

  it('should return 404 if not found', (done)=>{
    const aTodo = newTodos[0]
    request(app).patch(`/todos/${new ObjectID()}`)
    .expect(404)
    .end(done)
  })
})


describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', newUsers[0].tokens[0].token)
    .expect(200)
    .expect(res=>{
      expect(res.body._id).toBe(newUsers[0]._id.toHexString())
      expect(res.body.email).toBe(newUsers[0].email)
    })
    .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect(res=>{
      expect(res.body).toEqual({})
    })
    .end(done)
  })

})

describe('Post /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com'
    const password = '123456'
    request(app)
    .post('/users')
    .send({email, password})
    .expect(200)
    .expect(res=>{
      expect(res.headers['x-auth']).toBeTruthy()
      expect(res.body._id).toBeTruthy()
      expect(res.body.email).toEqual(email)
    })
    .end((err)=>{
      if(err){
        return done(err)
      }

      User.findOne({email}).then(user=>{
        expect(user).toBeTruthy()
        expect(user.password).not.toBe(password)
        done()
      })
    })
  })

  it('should return validation errors if request invalid', (done) => {
    request(app)
    .post('/users')
    .send({
      email: 'and',
      password: '123'
    })
    .expect(400)
    .end(done)
  })

  it('should not create user if email is already in use', (done) => {
    request(app)
    .post('/users')
    .send({
      email: newUsers[0].email,
      password: '123'
    })
    .expect(400)
    .end(done)
  })
})

describe('POST /users/login', () => {
  it('should return user if login succesful', (done) => {
    const user = newUsers[0]
    request(app)
    .post('/users/login')
    .send({
      email: user.email,
      password: user.password
    })
    .expect(200)
    .expect(res=>{
      expect(res.headers['x-auth']).toBeTruthy()
    })
    .end((err, res) => {
      if(err) {
        done(err)
      }
      User.findById(newUsers[0]._id).then(user=>{
        expect(user.tokens[user.tokens.length - 1].token).toEqual(res.headers['x-auth'])
        done()
      }).catch(e=>{
        done(e)
      })
    })
  })

  it('should should reject invalid login', (done) => {
    const user = newUsers[1]
    request(app)
    .post('/users/login')
    .send({
      email: user.email,
      password: user.password + '1'
    })
    .expect(400)
    .expect(res=>{
      expect(res.headers['x-auth']).toBeFalsy()
    })
    .end((err, res) => {
      if(err) {
        done(err)
      }
      User.findById(newUsers[1]._id).then(user=>{
        expect(user.tokens.length).toBe(0)
        done()
      }).catch(e=>{
        done(e)
      })
    })
  })

})

