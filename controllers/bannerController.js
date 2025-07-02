const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const bannerModel = require('../models/bannerModel');

const { mongo: { ObjectId } } = require('mongoose');

const moment = require('moment');

class bannerController {
    addBanner = async (req, res) => {
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

            const title = fields.title?.[0] || '';
            const description = fields.description?.[0] || '';
            const bannertype = fields.bannertype?.[0] || '';
            const device = fields.device?.[0] || '';
            const imageFile = files.image;
            const day = parseInt(fields.day?.[0]) || 0;
            // const videoFile = files.videos;

            console.log('Parsed day:', day);


            if (!title || !bannertype || !device) {
                return res.status(400).json({ message: 'Please fill all required fields' });
            }

            try {
                let imageUrl = '';
                let videoUrl = '';

                if (imageFile && imageFile[0]?.filepath) {
                    const uploadResult = await cloudinary.uploader.upload(imageFile[0].filepath, { folder: 'news_images' });
                    imageUrl = uploadResult.secure_url;
                }

                // if (videoFile && videoFile[0]?.filepath) {
                //     const videoResult = await cloudinary.uploader.upload(videoFile[0].filepath, {
                //         resource_type: 'video'
                //     });
                //     videoUrl = videoResult.secure_url;
                // }

                const newBanner = new bannerModel({
                    title,
                    image: imageUrl,
                    bannertype,
                    description,
                    device,
                    day,
                    // expireAt: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
                    expireAt: new Date(Date.now() + day * 60 * 1000)
                });

                await newBanner.save();

                return res.status(201).json({
                    message: 'Banner added successfully',
                    banner: newBanner
                });

            } catch (error) {
                console.error('Error saving banner:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    };

    getAllBanners = async (req, res) => {
        try {
            const banners = await bannerModel.find().sort({ createdAt: -1 });
            return res.status(200).json({ banners });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    updateBannerStatus = async (req, res) => {
        const { _id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(_id)) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }

        try {
            const updatedBanner = await bannerModel.findByIdAndUpdate(_id, { status }, { new: true });
            if (!updatedBanner) {
                return res.status(404).json({ message: 'Banner not found' });
            }
            return res.status(200).json({ message: 'Banner status updated successfully', banner: updatedBanner });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    getBannerById = async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }

        try {
            const banner = await bannerModel.findById(id);
            if (!banner) {
                return res.status(404).json({ message: 'Banner not found' });
            }
            return res.status(200).json({ banner });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    updateBanner = async (req, res) => {
        const { id } = req.params;
        const form = formidable({ multiples: true });
        form.parse(req, async (err, fields, files) => {

            if (err) {
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const { title, description, bannertype, device } = fields;
            const imageFile = files.image;

            if (!title || !bannertype || !device) {
                return res.status(400).json({ message: 'Please fill all required fields' });
            }

            try {
                let updateData = { title, bannertype, description, device };

                if (imageFile && imageFile.size > 0) {
                    const uploadResult = await cloudinary.uploader.upload(imageFile.path);
                    updateData.image = uploadResult.secure_url;
                }

                const updatedBanner = await bannerModel.findByIdAndUpdate(id, updateData, { new: true });
                if (!updatedBanner) {
                    return res.status(404).json({ message: 'Banner not found' });
                }

                return res.status(200).json({ message: 'Banner updated successfully', banner: updatedBanner });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Server error' });
            }
        });


    }


    deleteBanner = async (req, res) => {
        const { _id } = req.params;

        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        if (!_id) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }

        try {

            const banner = await bannerModel.findById(_id)

            if (!banner) {
                return res.status(404).json({ message: 'Banner not found' });
            }

            if (banner.image) {
                const urlParts = banner.image.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const publicId = 'news_images/' + fileName.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

             await bannerModel.findByIdAndDelete(_id);
            return res.status(200).json({ message: 'Banner deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

}

module.exports = new bannerController();