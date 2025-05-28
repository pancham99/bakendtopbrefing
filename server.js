// ─── Module Imports ───────────────────────────────────────
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // optional
// const serverless = require('serverless-http'); // for vercel or netlify

const db_connect = require('./utils/db');
const authRoutes = require('./routes/authRouters');
const newsRoutes = require('./routes/newsRoute');

// ─── Config & App Initialization ─────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(bodyParser.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bakendtopbrefing.vercel.app",
    "https://topbrefing-admin.vercel.app"
  ],
}));

// CORS setup (Allow specific origins)
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:3000",
//     "http://localhost:3001",
//     "https://bakendtopbrefing.vercel.app",
//     "https://topbrefing-admin.vercel.app"
//   ],
// }));

// Optional logging
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/', authRoutes);
app.use('/', newsRoutes);

// ─── Database Connection ──────────────────────────────────
db_connect();

// ─── Export App (for Vercel or other platforms) ───────────
module.exports = app;

// For local development only:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// For Vercel serverless functions (optional):
// module.exports.handler = serverless(app);








// const express = require('express')
// const app = express()
// // const morgan = require('morgan')
// const dotenv = require('dotenv')
// const body_parser = require('body-parser')
// const cors = require('cors')
// const db_connect = require('./utils/db')
// // const serverless = require('serverless-http');

// dotenv.config()



// app.use(body_parser.json())
// // app.use(morgan())

// if(process.env.MODE === 'production') {
//   app.use(cors())
// }else {
//   app.use(cors())
// }


// app.use(cors({
//     origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "https://bakendtopbrefing.vercel.app", "OPTIONS /api/images HTTP/1.1"],
   
//   }))
// app.use('/', require('./routes/authRouters'))
// app.use('/', require('./routes/newsRoute'))
// app.get('/', (req, res) => res.send('Hello World!'))

// const port = process.env.port

// db_connect()
// module.exports = app;

// // app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// // module.exports.handler = serverless(app);