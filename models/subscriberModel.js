const {model, Schema} = require('mongoose');

const subscriberSchema = new Schema({
    email: {
        type: String,
        // required: true,
        // unique: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

module.exports = model('Subscriber', subscriberSchema);
