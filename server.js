// ─── Module Imports ───────────────────────────────────────
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // optional

const http = require('http'); // for socket.io if needed
// const serverless = require('serverless-http'); // for vercel or netlify

const db_connect = require('./utils/db');
const authRoutes = require('./routes/authRouters');
const newsRoutes = require('./routes/newsRoute');
const bannerRoutes = require('./routes/bannerRouters');
const videoRoutes = require('./routes/videoRouters');



// ─── Config & App Initialization ─────────────────────────
dotenv.config();

const app = express();
const server = http.createServer(app); // 👈 wrap express in http

const io = require('socket.io')(server, {
  cors: {
    origin: '*', // allow all or specify frontend URL
    // methods: ['GET', 'POST']
  }
});


// Make io globally accessible
app.set('io', io); // 👈 attach io to app
// ─── Port Configuration ──────────────────────────────────
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

// CORS setup (Allow specific origins)
app.use(cors({
  origin: "*"
}));

// Optional logging
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/', authRoutes);
app.use('/', newsRoutes);
app.use('/', bannerRoutes);
app.use('/', videoRoutes);



// ─── Database Connection ──────────────────────────────────
db_connect();

// ─── Export App (for Vercel or other platforms) ───────────
module.exports = app;

// For local development only:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

