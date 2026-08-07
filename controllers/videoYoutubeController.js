const videoYoutube = require('../models/videoYoutubeModel');


class videoYoutubeController {
    addVideoYoutube = async (req, res) => {
        try {
            const { title, videoUrl } = req.body;

            if (!title || !videoUrl) {
                return res.status(400).json({
                    success: false,
                    message: "Title and videoUrl are required",
                });
            }

            // 2️⃣ Basic YouTube embed validation
            if (!videoUrl.includes("youtube.com/embed/")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid YouTube embed URL",
                });
            }

            const newVideo = await videoYoutube.create({
                title,
                videoUrl,
            });

            return res.status(201).json({
                success: true,
                message: "Video created successfully",
                data: newVideo,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    }

    getAllVideos = async (req, res) => {
        try {
            // Query params
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const skip = (page - 1) * limit;

            const totalVideos = await videoYoutube.countDocuments();

            const videos = await videoYoutube.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                success: true,
                currentPage: page,
                totalPages: Math.ceil(totalVideos / limit),
                totalVideos,
                data: videos,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    };

    getSingleVideo = async (req, res) => {
        try {
            const { id } = req.params;

            const video = await Video.findById(id);

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: "Video not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: video,
            });

        } catch (error) {

            // Invalid ObjectId case
            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid video ID",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    };


    deleteVideo = async (req, res) => {
        try {
            const { id } = req.params;

            const video = await Video.findById(id);

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: "Video not found",
                });
            }

            await video.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Video deleted successfully",
            });

        } catch (error) {

            if (error.name === "CastError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid video ID",
                });
            }

            return res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new videoYoutubeController();