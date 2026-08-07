const router = require('express').Router();
const videoYoutubeController = require('../controllers/videoYoutubeController');

router.post('/api/youtube/add', videoYoutubeController.addVideoYoutube);
router.get('/api/youtube/getall', videoYoutubeController.getAllVideos);
router.delete('/api/youtube/delete/:_id', videoYoutubeController.deleteVideo);





module.exports = router;