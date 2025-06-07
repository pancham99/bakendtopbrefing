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
const bannerRoutes = require('./routes/bannerRouters'); 



// ─── Config & App Initialization ─────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(bodyParser.json());

// CORS setup (Allow specific origins)
app.use(cors({
  origin: [



    "https://www.topbriefing.in/",
    
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://bakendtopbrefing.vercel.app",
    "https://topbrefing-admin.vercel.app",
    "https://newsportal-seven.vercel.app"
  ],
}));

// Optional logging
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/', authRoutes);
app.use('/', newsRoutes);
app.use('/', bannerRoutes);



// ─── Database Connection ──────────────────────────────────
db_connect();

// ─── Export App (for Vercel or other platforms) ───────────
module.exports = app;

// For local development only:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

