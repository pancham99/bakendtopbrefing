const commentModel = require('../models/commentModel');
const newsModel = require('../models/newsModel');

class commentController {

    // Add a comment to a news article
    add_comment = async (req, res) => {
        try {
            const { newsId, userId, userName, commentText } = req.body;

            if (!newsId || !userId || !userName || !commentText?.trim()) {
                return res.status(400).json({ message: 'newsId, userId, userName and commentText are required' });
            }

            // Check news exists
            const news = await newsModel.findById(newsId);
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            const newComment = await commentModel.create({
                newsId,
                userId,
                userName,
                commentText: commentText.trim()
            });

            // Push comment _id into news.comments array
            await newsModel.findByIdAndUpdate(newsId, {
                $push: { comments: newComment._id }
            });

            return res.status(201).json({
                message: 'Comment added successfully',
                comment: newComment
            });
        } catch (error) {
            console.error('Add comment error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Get all comments for a specific news article
    get_comments = async (req, res) => {
        try {
            const { newsId } = req.params;

            if (!newsId) {
                return res.status(400).json({ message: 'newsId is required' });
            }

            const comments = await commentModel
                .find({ newsId })
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: 'Comments fetched successfully',
                comments,
                count: comments.length
            });
        } catch (error) {
            console.error('Get comments error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Delete a comment (only the comment owner or admin can delete)
    delete_comment = async (req, res) => {
        try {
            const { commentId } = req.params;
            const { userId } = req.body;

            if (!commentId) {
                return res.status(400).json({ message: 'commentId is required' });
            }

            const comment = await commentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Only the comment owner can delete
            if (comment.userId.toString() !== userId?.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this comment' });
            }

            await commentModel.findByIdAndDelete(commentId);

            // Remove from news.comments array
            await newsModel.findByIdAndUpdate(comment.newsId, {
                $pull: { comments: comment._id }
            });

            return res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error) {
            console.error('Delete comment error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Get all comments (admin use)
    get_all_comments = async (req, res) => {
        try {
            const comments = await commentModel.find().sort({ createdAt: -1 });
            return res.status(200).json({ comments, count: comments.length });
        } catch (error) {
            console.error('Get all comments error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new commentController();
