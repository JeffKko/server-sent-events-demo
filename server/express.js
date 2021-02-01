const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
// const {
//   getUid,
//   crawlRuten,
// } = require('./api.js')

app.use(cors({
  origin: [
    'http://www.example.com',
    'http://localhost:3000',
    'http://10.1.1.32:3000',
  ],
  credentials: true,
}))
app.use(cookieParser())
// app.use('/ruruton', express.static(__dirname + '/dist'))
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
  new ChatEvent('國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國國'),
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
    res.write(`id: ${e.id}\ndata: ${e.message}\n\n`)
  })

  return id
}

app.post('/message', (req, res) => {
  const message = req.body.message

  const event = new ChatEvent(message)


  eventList.push(event)

  clientList.forEach(s => {
    console.log(event.id)
    s.res.write(`id: ${event.id}\ndata: ${event.message}\n\n`)
  })

  res.status(200).end()
})

/**
 *  每天0, 9, 15時爬蟲
 */
// schedule.scheduleJob('* 0,9,15 * * *', function(){
// })

app.get('/crawl/:id', (req, res) => {
  console.log(req.params.id)
  crawlEbayProduct(req.params.id)
    .then(data => {
      addProduct(data)
      res.json(data)
    })
    .catch(err => {
      res.status(400).json({ msg: err })
    })
})

app.get('/product/:id', (req, res) => {
  getEbayProduct(req.params.id)
    .then(data => {
      console.log('=============')
      console.log(data)
      res.json(data)
    })
    .catch(err => {
      console.log('-----------')
      console.log(err)
      res.status(400).json({ msg: err })
    })
})

app.post('/member/:uid/watchlist/:id', (req, res) => {
  const {uid} = req.cookies
  const productId = req.params.id
  // console.log(req.cookies)
  addWatchlist(uid, productId)
    .then(() => res.json())
    .catch(err => res.status(400).json({ msg: err }))
})

app.get('/member/:uid/watchlist', (req, res) => {
  const uid = req.params.uid

  console.log(uid)

  getWatchlist(uid)
    .then(data => res.json(data))
    .catch(err => res.status(400).json({ msg: err }))
})

app.get('/recent/watchlist', (req, res) => {
  getRecentWatchlist()
    .then(data => res.json(data))
    .catch(err => res.status(400).json({ msg: err }))
})

app.post('/hot-good/ebay', (req, res) => {
  getEbayGoods(req.body.startTime, req.body.endTime)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      res.status(400).json({ msg: err })
    })
})

app.post('/hot-good/amazon', (req, res) => {
  getAmazonGoods(req.body.startTime, req.body.endTime)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      res.status(400).json({ msg: err })
    })
})

module.exports = app

// const port = process.env.PORT || 8888;

// app.listen(process.env.PORT, function() {
//   console.log(`Example app listening on port ${port}!`);
// })

// $ export PORT=8000  //Mac
// $ set PORT=8000  //Windows
