const {model, Schema} = require('mongoose');

const subscriberSchema = new Schema({
    email: {
        type: String,
        default: null,
        index: { unique: true, sparse: true }
    },
    fcmToken: {
        type: String,
        default: null,
        index: { unique: true, sparse: true }
    },
    deviceInfo: {
        userAgent: String,
        platform: String
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

module.exports = model('Subscriber', subscriberSchema);
