const likeModel = require('../models/likeModel');
const newsModel = require('../models/newsModel');

class likeController {

    // Toggle like — if user already liked, unlike it; otherwise add like
    toggle_like = async (req, res) => {
        try {
            const { newsId, userId } = req.body;

            if (!newsId || !userId) {
                return res.status(400).json({ message: 'newsId and userId are required' });
            }

            // Check if news exists
            const news = await newsModel.findById(newsId);
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            // Check if already liked
            const existing = await likeModel.findOne({ newsId, userId });

            if (existing) {
                // Unlike: remove like doc and pull from news.likes
                await likeModel.findByIdAndDelete(existing._id);
                await newsModel.findByIdAndUpdate(newsId, {
                    $pull: { likes: existing._id }
                });

                const likeCount = await likeModel.countDocuments({ newsId });
                return res.status(200).json({
                    message: 'Unliked successfully',
                    liked: false,
                    likeCount
                });
            } else {
                // Like: create like doc and push into news.likes
                const newLike = await likeModel.create({ newsId, userId });
                await newsModel.findByIdAndUpdate(newsId, {
                    $push: { likes: newLike._id }
                });

                const likeCount = await likeModel.countDocuments({ newsId });
                return res.status(201).json({
                    message: 'Liked successfully',
                    liked: true,
                    likeCount
                });
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Get like count + whether a specific user has liked
    get_likes = async (req, res) => {
        try {
            const { newsId } = req.params;
            const { userId } = req.query;

            if (!newsId) {
                return res.status(400).json({ message: 'newsId is required' });
            }

            const likeCount = await likeModel.countDocuments({ newsId });

            let liked = false;
            if (userId) {
                const existing = await likeModel.findOne({ newsId, userId });
                liked = !!existing;
            }

            return res.status(200).json({ likeCount, liked });
        } catch (error) {
            console.error('Get likes error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Get all users who liked a news article (admin use)
    get_likes_detail = async (req, res) => {
        try {
            const { newsId } = req.params;

            if (!newsId) {
                return res.status(400).json({ message: 'newsId is required' });
            }

            const likes = await likeModel
                .find({ newsId })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                likeCount: likes.length,
                likes
            });
        } catch (error) {
            console.error('Get likes detail error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new likeController();
