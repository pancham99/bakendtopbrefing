const express = require('express')
const app = express()
// const morgan = require('morgan')
const dotenv = require('dotenv')
const body_parser = require('body-parser')
const cors = require('cors')
const db_connect = require('./utils/db')
// const serverless = require('serverless-http');

dotenv.config()



app.use(body_parser.json())
// app.use(morgan())

if(process.env.mode === 'production') {
  app.use(cors())
}else {
  app.use(cors())
}





app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "https://bakendtopbrefing.vercel.app", "OPTIONS /api/images HTTP/1.1"],
   
  }))
app.use('/', require('./routes/authRouters'))
app.use('/', require('./routes/newsRoute'))
app.get('/', (req, res) => res.send('Hello World!'))

const port = process.env.port

db_connect()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// module.exports.handler = serverless(app);