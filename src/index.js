// initialize .env
require('dotenv').config()

// Dependencies
const express = require('express')
const bodyparser = require('body-parser')
const app = express()

// Body parser middleware
app.use(bodyparser.json())

// Github ping route
app.post('/', (req, res) => {
  res.status(200).send('OK')
})

// Post endpoint for github webhook
app.post('/github/autodeploy', (req, res) => {
  console.log(req.body)
})

// Allow lowercase and uppercase
const PORT = Number(process.env.PORT) || Number(process.env.port)
const HOST = process.env.HOST || process.env.host

// Listen
app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}`)
})