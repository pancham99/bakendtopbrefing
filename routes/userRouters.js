const router = require('express').Router();
const userController = require('../controllers/userController');

router.post('/api/user/register', userController.register);
router.post('/api/user/login', userController.login);





module.exports = router;