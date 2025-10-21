const router = require('express').Router();
const authController = require('../controllers/authControllers');
const middleware = require('../middlewares/middleware');


router.post('/api/login', authController.login)
router.post('/api/news/writer/add', middleware.auth, middleware.role, authController.add_writer)
router.delete('/api/news/writer/delete/:user_id', middleware.auth, middleware.role, authController.delete_writer)
router.get('/api/news/writers', middleware.auth, middleware.role,  authController.get_writers)
router.put('/api/news/update_avatar', middleware.auth, authController.update_avatar)
router.get('/api/news/get_user', middleware.auth, authController.get_user)
router.put('/api/news/writer_status-update/:user_id', middleware.auth, authController.update_user_status)
router.put('/api/news/rest_user_password',middleware.auth,  authController.reset_password)

<<<<<<< HEAD




=======
>>>>>>> cdd13304 (Initial commit)
module.exports = router;