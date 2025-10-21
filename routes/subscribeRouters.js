const router = require('express').Router();
const multer = require('multer');
const upload = multer(); // no disk storage, just parses form-data
const subscribeController = require("../controllers/subscriberController")


router.post('/api/add/subscriber',upload.none(), subscribeController.add_subscriber)

module.exports = router;