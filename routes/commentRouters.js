const router = require('express').Router();
const commentController = require('../controllers/commentController');

// POST /api/comment/add        — body: { newsId, userId, userName, commentText }
router.post('/api/comment/add', commentController.add_comment);

// GET  /api/comment/get/:newsId — get all comments for a news article
router.get('/api/comment/get/:newsId', commentController.get_comments);

// DELETE /api/comment/delete/:commentId — body: { userId }
router.delete('/api/comment/delete/:commentId', commentController.delete_comment);

// GET  /api/comment/all         — admin: get all comments
router.get('/api/comment/all', commentController.get_all_comments);

module.exports = router;
