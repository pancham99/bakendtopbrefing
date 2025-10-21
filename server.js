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
const videoRoutes = require('./routes/videoRouters');
const advertisementRoutes = require('./routes/advertisementRouters');
const userRoutes = require('./routes/userRouters'); 
const commentRoutes = require('./routes/commentRouters'); // Uncomment if you have comment routes
const subscribeRouters = require('./routes/subscribeRouters');



// ─── Config & App Initialization ─────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({extended: true }));

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
app.use('/', advertisementRoutes);
app.use('/', userRoutes); // Uncomment if you have user routes
app.use('/', commentRoutes); // Uncomment if you have comment routes
app.use('/', subscribeRouters)



// ─── Database Connection ──────────────────────────────────
db_connect();

// ─── Export App (for Vercel or other platforms) ───────────
module.exports = app;

// For local development only:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

