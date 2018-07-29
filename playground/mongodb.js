const { MongoClient } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongoDB server')
  }
  console.log('connect to mongoDB server succeeded')

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Inserting went go', err)
  //   }
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2))
  // })
  db.collection('Todos').find({completed: false}).toArray().then(res => {
    console.log(JSON.stringify(res, undefined, 2))
  })
  .catch(e => {
    console.log('fetch error')
  })

  db.collection('Todos').find().count().then(count => {
    console.log(`Todos count: ${count}`)
  })
  .catch(e => {
    console.log('fetch error')
  })

  // CRUD
  // db.close()
})