// initialize .env
require('dotenv').config()

// Dependencies
const express = require('express')

const app = express()

// Body parser middleware
const bodyparser = require('body-parser')
app.use(bodyparser.json())

// Github payload verification middleware
const verifyPayload = require('./util/verifyPayload')
app.use(verifyPayload)

// Github ping route
app.post('/', (req, res) => {
  res.status(200).send('OK')
})

// Post endpoint for github webhook
app.post('/github/autodeploy', (req, res) => {
  console.log(req.headers)
  console.log(req.body)
})

// Allow lowercase and uppercase
const PORT = Number(process.env.PORT) || Number(process.env.port)
const HOST = process.env.HOST || process.env.host

// Listen
app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}`)
})