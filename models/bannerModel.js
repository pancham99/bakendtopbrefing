const {model, Schema} = require('mongoose');

const bannerSchem = new Schema({
    title: {
        type: String,
    },
    image: {
        type: String,
        default: ''
    },
    bannertype: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'pending'
    },
    device: {
        type: String,   
        default: 'all'
    },

}, {timestamps: true});

module.exports = model('banner', bannerSchem);