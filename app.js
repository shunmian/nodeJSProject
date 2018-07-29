const express = require('express')
const hbs = require('hbs')

const port = process.env.PORT || 3000
const app = express()

hbs.registerPartials(__dirname + '/Views/partials')
hbs.registerHelper('getCurrentYear', ()=> {
  return 'ya haha'
})

app.set('view engine', hbs)
app.use((req, res, next) => {
  const log = `${new Date()}: ${req.method}, ${req.url}`
  console.log(log)
  next()
})

app.use((req, res, next)=> {
  res.render('maintenance.hbs')
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.send('<h1>Hello world!<h1>')
})

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About page',
    currentYear: new Date().getFullYear()
  })
})

app.listen(port, () => {
  console.log(`Server is up on part ${port}`)
})

















