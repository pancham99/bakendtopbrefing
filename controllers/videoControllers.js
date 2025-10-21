const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const videoModel = require('../models/videoModel');

const { mongo: { ObjectId } } = require('mongoose');

const moment = require('moment');

class videoController {

    // addVideo = async (req, res) => {
    //     const form = formidable({ multiples: false,  maxFileSize: 500 * 1024 * 1024,}); // 200MB max

    //     cloudinary.config({
    //         cloud_name: process.env.CLODINARY_CLOUD_NAME,
    //         api_key: process.env.CLODINARY_API_KEY,
    //         api_secret: process.env.CLODINARY_API_SECRET_KEY,
    //         secure: true
    //     });

    //     form.parse(req, async (err, fields, files) => {
    //         if (err) {
    //             console.error('Form parse error:', err);
    //             return res.status(500).json({ message: 'Form parse error' });
    //         }

    //         const title = fields.title?.[0] || '';
    //         const videotype = fields.videotype?.[0] || '';
    //         const videoFile = files.videos;
    //         // const videoFileUrl = fields.videourl?.[0] || '';

    //         let url = '';
    //         // let videourls = '';

    //         try {
    //             // Upload video file if present
    //             if (videoFile && videoFile[0]?.filepath) {
    //                 const videoResult = await cloudinary.uploader.upload(videoFile[0].filepath, {
    //                     resource_type: 'video'
    //                 });
    //                 url = videoResult.secure_url;
    //             }

    //             // Upload video from URL if present
    //             // if (videoFileUrl) {
    //             //     const videoUrlResult = await cloudinary.uploader.upload(videoFileUrl, {
    //             //         resource_type: 'video'
    //             //     });
    //             //     videourls = videoUrlResult.secure_url;
    //             // }

    //             const newVideo = new videoModel({
    //                 title,
    //                 videos: url,
    //                 videotype,
    //                 status: 'pending',
    //             });

    //             await newVideo.save();

    //             res.status(201).json({
    //                 message: 'Video added successfully',
    //                 data: newVideo
    //             });
    //         } catch (error) {
    //             console.error('Cloudinary upload error:', error);
    //             res.status(500).json({ message: 'Video upload failed' });
    //         }
    //     });
    // };

    addVideo = async (req, res) => {
        try {
            const { title, videos, videotype } = req.body;

            if (!title || !videos || !videotype) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Optional: verify the URL is a Cloudinary video
            if (!videos.startsWith('https://res.cloudinary.com/')) {
                return res.status(400).json({ message: 'Invalid video URL' });
            }

            const newVideo = new videoModel({
                title,
                videos, // Cloudinary URL from frontend
                videotype,
                status: 'pending',
            });

            await newVideo.save();

            res.status(201).json({
                message: 'Video added successfully',
                data: newVideo,
            });
        } catch (error) {
            console.error('Error saving video:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };



    getAllVideos = async (req, res) => {
        try {
            const videos = await videoModel.find().sort({ createdAt: -1 });
            res.status(200).json({ data: videos });
        } catch (error) {
            console.error('Error fetching videos:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    updateVideoStatus = async (req, res) => {
        const { _id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        try {
            const updatedVideo = await videoModel.findByIdAndUpdate(_id,
                { status },
                { new: true }

            );
            if (!updatedVideo) {
                return res.status(404).json({ message: 'Video not found' });
            }
            res.status(200).json({ message: 'Video status updated successfully', data: updatedVideo });
        } catch (error) {
            console.error('Error updating video status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    // delete video with also delete in cloudninary form

    deleteVideo = async (req, res) => {
        const { _id } = req.params;

        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        });

        if (!_id || _id.length !== 24) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        try {
            const video = await videoModel.findByIdAndDelete(_id);
            if (!video) {
                return res.status(404).json({ message: 'Video not found' });
            }

            // Delete video from Cloudinary
            const publicId = video.videos.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

            res.status(200).json({ message: 'Video deleted successfully' });
        } catch (error) {
            console.error('Error deleting video:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new videoController();