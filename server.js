// ─── Module Imports ───────────────────────────────────────
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // optional
// const serverless = require('serverless-http'); // for vercel or netlify
const path = require("path");
const db_connect = require('./utils/db');
const authRoutes = require('./routes/authRouters');
const newsRoutes = require('./routes/newsRoute');
const bannerRoutes = require('./routes/bannerRouters');
const videoRoutes = require('./routes/videoRouters');
const advertisementRoutes = require('./routes/advertisementRouters');
const userRoutes = require('./routes/userRouters'); 
const commentRoutes = require('./routes/commentRouters');
const likeRoutes = require('./routes/likeRouters');
const subscribeRouters = require('./routes/subscribeRouters');
const videoYoutubeRouters = require('./routes/videoYoutubeRouters');



// ─── Config & App Initialization ─────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use("/assets", express.static(path.join(__dirname, "public")));
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
app.use('/', commentRoutes);
app.use('/', likeRoutes);
app.use('/', subscribeRouters);
app.use('/', videoYoutubeRouters);

db_connect();

// ─── Export App (for Vercel or other platforms) ───────────
module.exports = app;

// For local development only:
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

