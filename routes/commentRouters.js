const router = require('express').Router();
const newsController = require('../controllers/commentController');

router.post('/api/comment/add', newsController.add_comment);
router.get('/api/comment/get_all', newsController.get_all_comments);
router.get('/api/comment/get/:newsId', newsController.get_comments);

module.exports = router;