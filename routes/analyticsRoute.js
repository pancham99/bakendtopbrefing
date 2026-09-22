const router = require('express').Router();
const  nanalyticsController = require('../controllers/analyticsController');

router.post('/api/news/click', nanalyticsController.newsClick);
router.get('/api/analytics', nanalyticsController.getAnalytics);

module.exports = router;
