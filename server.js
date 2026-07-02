// ─── Module Imports ───────────────────────────────────────
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const db_connect = require('./utils/db');
const authRoutes = require('./routes/authRouters');
const newsRoutes = require('./routes/newsRoute');
const bannerRoutes = require('./routes/bannerRouters');
const videoRoutes = require('./routes/videoRouters');
const advertisementRoutes = require('./routes/advertisementRouters');
const userRoutes = require('./routes/userRouters');
const commentRoutes = require('./routes/commentRouters');
const subscribeRouters = require('./routes/subscribeRouters');
const videoYoutubeRouters = require('./routes/videoYoutubeRouters');
const { router: sseRouters, initRedisSubscriber } = require('./routes/sseRouters');

// ─── Config & App Initialization ─────────────────────────
dotenv.config();

// NOTE: dns.setServers hack removed — Node v20 LTS resolves
// MongoDB Atlas hostnames correctly without any workarounds.

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: '*'
}));

app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────
app.get('/', (_, res) => res.send('Hello World!'));

app.use('/', authRoutes);
app.use('/', newsRoutes);
app.use('/', bannerRoutes);
app.use('/', videoRoutes);
app.use('/', advertisementRoutes);
app.use('/', userRoutes);
app.use('/', commentRoutes);
app.use('/', subscribeRouters);
app.use('/', videoYoutubeRouters);

// SSE endpoint — frontend EventSource yahan connect karega
app.use('/', sseRouters);

// ─── Database & Redis ─────────────────────────────────────
db_connect();

// Redis subscriber: server startup pe ek baar initialize karo
// Baar baar call karne pe duplicate subscriptions ban jaayenge
initRedisSubscriber();

// ─── Export App (for Vercel / serverless) ────────────────
module.exports = app;

// Local development server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

