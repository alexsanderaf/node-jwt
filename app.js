require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('./database/database')
const userRoute = require('./routes/routes')



app.use(express.json())

mongoose()


app.use('/', userRoute)


app.listen(3000)