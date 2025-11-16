const router = require('express').Router();
const middleware = require('../middlewares/middleware');
const newsController = require('../controllers/newsController');

router.post('/api/news/add', middleware.auth, newsController.add_news);
router.put('/api/news/update/:news_id', middleware.auth, newsController.update_news);

router.put('/api/news/status-update/:news_id', middleware.auth, newsController.update_news_status);
router.delete('/api/news/delete/:news_id', middleware.auth, middleware.role, newsController.delete_news);

router.get('/api/images', middleware.auth, newsController.get_images);
router.post('/api/images/add', middleware.auth, newsController.add_images);


router.get('/api/news', middleware.auth, newsController.get_dashboard_news);
router.get('/api/news/:news_id', middleware.auth, newsController.get_dashboard_single_news);


// website

router.get('/api/all/news', newsController.get_all_news);
router.get('/api/popular/news', newsController.get_popular_news);
router.get('/api/latest/news', newsController.get_latest_news);

router.get('/api/news/details/:slug', newsController.get_news);
router.get('/api/news/details/title/:title', newsController.get_news_title);



router.get('/api/category/all', newsController.get_categories);

router.get('/api/news/category/:category',newsController.get_category_by_name);
// get_get_news_state name
router.get('/api/news/state/:state', newsController.get_news_state);
router.get('/api/search/news', newsController.get_seach_news);
router.get('/api/news/recent/news', newsController.get_recent_news );

// delete router
router.post('/news/delete-multiple', middleware.auth, middleware.role, newsController.delete_multiple_news);






module.exports = router;