const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true })

const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    require: true,
    trim: true,
    minlength: 1,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null
  }
})

const newTodo = new Todo({
  text: 'Run',
})

newTodo.save().then(res => {
  console.log('Saved todo: ',res)
}).catch(e=>{
  console.log('Save error:', e)
})