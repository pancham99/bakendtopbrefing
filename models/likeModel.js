const { model, Schema } = require('mongoose');

const likeSchema = new Schema({
    newsId: {
        type: Schema.Types.ObjectId,
        ref: 'News',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = model('Like', likeSchema);
