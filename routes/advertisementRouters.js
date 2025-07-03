const router = require('express').Router();
const advertisementController = require('../controllers/advertisementController');

router.post('/api/advertisement/add',  advertisementController.addAdvertisement);
router.get('/api/advertisement/getall', advertisementController.getAllAdvertisements);
router.get('/api/advertisement/bases/input', advertisementController.getAdvertisements);
router.put('/api/advertisement/update/:_id', advertisementController.updateAdvertisement);
router.get('/api/advertisement/get/:_id', advertisementController.getAdvertisementById);
router.delete('/api/advertisement/delete/:_id', advertisementController.deleteAdvertisement);
router.put('/api/advertisement/status/:_id', advertisementController.update_ststus_advertisement);

module.exports = router;