const router = require('express').Router();
const likeController = require('../controllers/likeController');

// POST /api/like/toggle  — body: { newsId, userId }
router.post('/api/like/toggle', likeController.toggle_like);

// GET /api/like/:newsId?userId=xxx  — get like count + liked status
router.get('/api/like/:newsId', likeController.get_likes);

module.exports = router;
