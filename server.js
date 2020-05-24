require('dotenv').config()

const express = require('express')  
const itemsRoutes = require('./routes/items.routes')

const app = express()
app.use(express.json())
app.use(express.static('dist'))
app.use('/img', express.static('img'))
app.use('/items', itemsRoutes)

app.listen(process.env.APP_PORT, process.env.APP_HOST)

console.log(`Running on http://${process.env.APP_HOST}:${process.env.APP_PORT}`)
