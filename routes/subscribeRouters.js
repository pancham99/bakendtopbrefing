const router = require('express').Router();
const multer = require('multer');
const upload = multer(); // no disk storage, just parses form-data
const subscribeController = require("../controllers/subscriberController")


router.post('/api/add/subscriber', upload.none(), subscribeController.add_subscriber);
router.post('/api/fcm/save-token', subscribeController.save_fcm_token);
router.get('/get/subscribers', subscribeController.get_all_subscribers);
router.delete('/api/subscribers/:id', subscribeController.delete_subscriber);

module.exports = router;