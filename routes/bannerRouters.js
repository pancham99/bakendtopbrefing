const router = require('express').Router();
const bannerController = require('../controllers/bannerController');

router.post('/api/banner/add',  bannerController.addBanner);
router.get('/api/banner/getall', bannerController.getAllBanners);
router.put('/api/banner/status/:_id', bannerController.updateBannerStatus);
router.get('/api/banner/get/:id', bannerController.getBannerById);
router.delete('/api/banner/delete/:_id', bannerController.deleteBanner);

module.exports = router;