const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const advertisementModel = require('../models/advertisementModel');

const { mongo: { ObjectId } } = require('mongoose');

const moment = require('moment');

class advertisementController {

    addAdvertisement = async (req, res) => {
        const form = formidable({ multiples: false });
        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(500).json({ message: 'Form parse error' });
            }

            // Extract fields
            const title = fields.title?.[0] || '';
            const description = fields.description?.[0] || '';
            const bannerType = fields.bannerType?.[0] || '';
            const companyName = fields.companyName?.[0] || '';
            const deviceTarget = fields.deviceTarget?.[0] || 'all';
            const pageTarget = fields.pageTarget?.[0] || 'all';
            const locationTarget = fields.locationTarget?.[0] || 'all';
            const placementKey = fields.placementKey?.[0] || 'top';
            const link = fields.link?.[0] || '';
            const priority = parseInt(fields.priority?.[0]) || 0;
            const amount = parseInt(fields.amount?.[0]) || 0;
            const dayDuration = parseInt(fields.dayDuration?.[0]) || 0;

            const imageFile = files.image;
            const videoFile = files.video;

            // Validation
            if (!title || !bannerType || !companyName) {
                return res.status(400).json({
                    message: 'Please fill all required fields: title, bannerType, companyName'
                });
            }

            try {
                let imageUrl = '';
                let videoUrl = '';

                if (imageFile && imageFile[0]?.filepath) {
                    const uploadResult = await cloudinary.uploader.upload(imageFile[0].filepath, { folder: 'news_images' });
                    imageUrl = uploadResult.secure_url;
                }

                if (videoFile && videoFile[0]?.filepath) {
                    const videoResult = await cloudinary.uploader.upload(videoFile[0].filepath, {
                        resource_type: 'video'
                    });
                    videoUrl = videoResult.secure_url;
                }

                const startDate = new Date();
                const expireAt = new Date(startDate.getTime() + dayDuration * 24 * 60 * 60 * 1000);

                const newAdvertisement = new advertisementModel({
                    title,
                    companyName,
                    description,
                    bannerType,
                    deviceTarget,
                    pageTarget,
                    locationTarget,
                    placementKey,
                    link,
                    priority,
                    dayDuration,
                    image: imageUrl,
                    video: videoUrl,
                    startDate,
                    expireAt,
                    amount,
                    status: 'pending'  // default: admin needs to activate
                });

                await newAdvertisement.save();

                return res.status(201).json({
                    message: 'Advertisement added successfully',
                    advertisement: newAdvertisement
                });

            } catch (error) {
                console.error('Error saving advertisement:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    };

    getAllAdvertisements = async (req, res) => {
        try {
            const advertisements = await advertisementModel.find().sort({ createdAt: -1 });
            return res.status(200).json(advertisements);
        } catch (error) {
            console.error('Error fetching advertisements:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    getBannersForFrontend = async (req, res) => {
        try {
            const { pageTarget, deviceTarget } = req.query;

            // Base query: active banners, not expired
            let query = {
                status: 'active',
                expireAt: { $gte: new Date() }
            };

            // Page targeting (match or 'all')
            if (pageTarget) {
                query.pageTarget = { $in: [pageTarget, 'all'] };
            }

            // Device targeting (match or 'all')
            if (deviceTarget) {
                query.deviceTarget = { $in: [deviceTarget, 'all'] };
            }

            // Fetch banners with priority desc, createdAt desc
            const banners = await advertisementModel.find(query)
                .sort({ priority: -1, createdAt: -1 });

            return res.json({
                success: true,
                banners
            });

        } catch (err) {
            console.error('Error fetching banners:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    };

    updateAdvertisement = async (req, res) => {
        const { _id } = req.params;
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(500).json({ message: 'Form parse error' });
            }

            try {
                const updateData = {};

                // Extract fields
                const title = fields.title?.[0] || '';
                const description = fields.description?.[0] || '';
                const bannerType = fields.bannerType?.[0] || '';
                const companyName = fields.companyName?.[0] || '';
                const deviceTarget = fields.deviceTarget?.[0] || 'all';
                const pageTarget = fields.pageTarget?.[0] || 'all';
                const locationTarget = fields.locationTarget?.[0] || 'all';
                const placementKey = fields.placementKey?.[0] || 'top';
                const link = fields.link?.[0] || '';
                const priority = parseInt(fields.priority?.[0]) || 0;
                const amount = parseInt(fields.amount?.[0]) || 0;
                const dayDuration = parseInt(fields.dayDuration?.[0]) || 0;

                if (title) updateData.title = title;
                if (description) updateData.description = description;
                if (bannerType) updateData.bannerType = bannerType;
                if (deviceTarget) updateData.deviceTarget = deviceTarget;
                if (companyName) updateData.companyName = companyName;
                if (pageTarget) updateData.pageTarget = pageTarget;
                if (locationTarget) updateData.locationTarget = locationTarget;
                if (placementKey) updateData.placementKey = placementKey;
                if (link) updateData.link = link;
                if (!isNaN(amount)) updateData.amount = amount;
                if (!isNaN(priority)) updateData.priority = priority;
                if (!isNaN(dayDuration)) {
                    updateData.dayDuration = dayDuration;
                    updateData.expireAt = new Date(Date.now() + dayDuration * 24 * 60 * 60 * 1000);
                }

                // Handle file uploads
                const imageFile = files.image;
                const videoFile = files.video;

                cloudinary.config({
                    cloud_name: process.env.CLODINARY_CLOUD_NAME,
                    api_key: process.env.CLODINARY_API_KEY,
                    api_secret: process.env.CLODINARY_API_SECRET_KEY,
                    secure: true
                });

                if (imageFile && imageFile[0]?.filepath) {
                    const uploadResult = await cloudinary.uploader.upload(imageFile[0].filepath);
                    updateData.image = uploadResult.secure_url;
                }

                if (videoFile && videoFile[0]?.filepath) {
                    const videoResult = await cloudinary.uploader.upload(videoFile[0].filepath, {
                        resource_type: 'video'
                    });
                    updateData.video = videoResult.secure_url;
                }

                // Update advertisement in the database
                const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(_id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );
                if (!updatedAdvertisement) {
                    return res.status(404).json({ message: 'Advertisement not found' });
                }
                return res.status(200).json({
                    message: 'Advertisement updated successfully',
                    advertisement: updatedAdvertisement
                });
            } catch (error) {
                console.error('Error updating advertisement:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    };

    update_ststus_advertisement = async (req, res) => {
        const { _id } = req.params;
        const { status } = req.body;

        try {
             const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(_id, { status }, { new: true })

            if (!updatedAdvertisement) {
                return res.status(404).json({ message: 'Advertisement not found' });
            }

            return res.status(200).json({
                message: 'Advertisement status updated successfully',
                advertisement: updatedAdvertisement
            });
        } catch (error) {
            console.error('Error updating advertisement status:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }


    //   delete advertaiment with cloude
    deleteAdvertisement = async (req, res) => {
        const { _id } = req.params;
        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        try {

            const advertis = await advertisementModel.findById(_id)
            if (advertis.image) {
                const urlParts = advertis.image.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const publicId = 'news_images/' + fileName.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
             await advertisementModel.findByIdAndDelete(_id);

            // if (!advertisement) {
            //     return res.status(404).json({ message: 'Advertisement not found' });
            // }

            // Optionally, you can also delete the image and video from Cloudinary
            // if (advertisement.image) {
            //     await cloudinary.uploader.destroy(advertisement.image);
            // }
            // if (advertisement.video) {
            //     await cloudinary.uploader.destroy(advertisement.video, { resource_type: 'video' });
            // }

            return res.status(200).json({ message: 'Advertisement deleted successfully' });
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    getAdvertisements = async (req, res) => {
        try {
            const { pageTarget, deviceTarget, placementKey } = req.query;

            // Base query
            let query = {
                status: 'active',
                expireAt: { $gte: new Date() }
            };

            // Dynamic filters
            if (pageTarget) {
                query.pageTarget = { $in: [pageTarget, 'all'] };
            }

            if (deviceTarget) {
                query.deviceTarget = { $in: [deviceTarget, 'all'] };
            }

            if (placementKey) {
                query.placementKey = placementKey;
            }

            // Fetch banner based on priority + createdAt
            const banner = await advertisementModel.findOne(query)
                .sort({ priority: -1, createdAt: -1 })
                .lean();

            // Response
            if (!banner) {
                return res.json({
                    success: true,
                    banner: null,
                    message: "No advertisement found for given criteria"
                });
            }

            return res.json({
                success: true,
                banner
            });

        } catch (err) {
            console.error("Error fetching ad:", err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    };

    getAdvertisementById = async (req, res) => {
        const { _id } = req.params;

        try {
            const advertisement = await advertisementModel.findById(_id);
            if (!advertisement) {
                return res.status(404).json({ message: 'Advertisement not found' });
            }
            return res.status(200).json(advertisement);
        } catch (error) {
            console.error('Error fetching advertisement:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };











}

module.exports = new advertisementController();