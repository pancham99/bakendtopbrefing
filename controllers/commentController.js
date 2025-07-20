const commentModel = require('../models/commentModel');
const newsModel = require('../models/newsModel');

class commentController {
    add_comment = async (req, res) => {
        try {
            const { newsId, userId, userName, commentText } = req.body;
            console.log(req.body);

            if (!newsId || !userId || !userName || !commentText) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Step 1: Comment create 
            const newComment = new commentModel({
                newsId,
                userId,
                userName,
                commentText
            });

            await newComment.save();

            // ✅ Step 2: news comment  _id push 
            await newsModel.findByIdAndUpdate(
                newsId,
                { $push: { comments: newComment._id } },
                { new: true }
            );

            res.status(201).json({
                message: 'Comment added successfully',
                comment: newComment
            });
        } catch (error) {
            console.log("Error adding comment:", error);
            res.status(500).json({ message: 'Failed to add comment', error });
        }
    };

    // get all commnet
    get_all_comments = async (req, res) => {
        try {
            const banners = await commentModel.find().sort({ createdAt: -1 });
            return res.status(200).json({ banners });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    get_comments = async (req, res) => {
    try {
        const { newsId } = req.params;


        if (!newsId) {
            return res.status(400).json({ message: 'News ID is required' });
        }

        // सभी कमेंट्स निकालो जिनका newsId यह है
        const comments = await commentModel.find({ newsId }).populate('userId', 'userName').sort({ createdAt: -1 });

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: 'No comments found for this news' });
        }

        res.status(200).json({
            message: 'Comments fetched successfully',
            comments
        });
    } catch (error) {
        console.log("Error fetching comments:", error);
        res.status(500).json({ message: 'Failed to fetch comments', error });
    }
};


}

module.exports = new commentController();