const router = require('express').Router();
const userController = require('../controllers/userController');

router.post('/api/user/sinup', userController.register);
router.post('/api/user/sing', userController.login);





module.exports = router;