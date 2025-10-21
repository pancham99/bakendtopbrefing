const { model, Schema } = require('mongoose');

const commentSchema = new Schema({
    newsId: {
        type: Schema.Types.ObjectId,
        ref: 'news',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    commentText: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = model('Comment', commentSchema);
