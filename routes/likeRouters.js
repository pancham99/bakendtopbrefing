const router = require('express').Router();
const likeController = require('../controllers/likeController');

// POST /api/like/toggle  — body: { newsId, userId }
router.post('/api/like/toggle', likeController.toggle_like);

// GET /api/like/detail/:newsId  — get all users who liked (admin) — MUST be before /:newsId
router.get('/api/like/detail/:newsId', likeController.get_likes_detail);

// GET /api/like/:newsId?userId=xxx  — get like count + liked status
router.get('/api/like/:newsId', likeController.get_likes);

module.exports = router;
