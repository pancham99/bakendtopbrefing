const router = require('express').Router();
const videoControllers = require('../controllers/videoControllers');

router.post('/api/video/add', videoControllers.addVideo);
router.get('/api/video/getall', videoControllers.getAllVideos);
router.put('/api/video/update_status/:_id', videoControllers.updateVideoStatus);
router.delete('/api/video/delete/:_id', videoControllers.deleteVideo);




module.exports = router;