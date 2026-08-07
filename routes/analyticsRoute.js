const router = require('express').Router();
const  nanalyticsController = require('../controllers/analyticsController');

router.post('/api/news/click', nanalyticsController.newsClick);

module.exports = router;
