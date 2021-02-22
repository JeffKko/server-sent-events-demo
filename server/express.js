const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()

app.use(cors({
  origin: [
    'http://www.example.com',
    'http://localhost:8080',
  ],
  credentials: true,
}))
app.use(cookieParser())

console.log(express.static(process.cwd() + '/dist'))

console.log(process.cwd())

app.use('/', express.static(process.cwd() + '/dist'))
app.use(express.json()) // parse json

app.get('/test', (req, res) => {
  res.status(200).send('im a test')
})

class ChatEvent {
  constructor(message) {
    this.id = Date.now()
    this.message = message
  }
}

let eventList = [
  new ChatEvent('Hi'),
  new ChatEvent('你要來嗎？'),
  new ChatEvent('來啊 哪次不來了？'),
  new ChatEvent('國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國'),
  new ChatEvent('美利達 scultura 車系 新春優惠8折起'),
]

let clientList = []

setInterval(() => {
  console.log(`currently user: ${clientList.length}`)

  if (!!clientList.length) {
    clientList.forEach(s => {
      s.res.write(': keep stream...')
    })
  }
}, 10000)

app.get('/event', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  sendHistory(res)

  const clientId = Date.now()
  const newClient = {
    id: clientId,
    res,
  }

  clientList.push(newClient)

  req.on('close', () => {
    console.log(`${clientId} Connection closed`)
    clientList = clientList.filter(s => s.id !== clientId)
  })
})

function sendHistory(res) {
  let id

  eventList.forEach(e => {
    id = e.id
    res.write(`id: ${e.id}\ndata: ${JSON.stringify(e)}\n\n`)
  })

  return id
}

app.post('/message', (req, res) => {
  const message = req.body.message

  const event = new ChatEvent(message)

  eventList.push(event)

  clientList.forEach(s => {
    console.log(event.id)
    s.res.write(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`)
  })

  res.status(200).end()
})

module.exports = app
