const {model, Schema} = require('mongoose');

const bannerSchem = new Schema({
    title: {
        type: String,
    },
    image: {
        type: String,
        default: ''
    },
    videos:{
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
    day: {
        type: Number,   
        default: 0
    },
    expireAt: Date ,
    device: {
        type: String,   
        default: 'all'
    },

}, {timestamps: true});

module.exports = model('banner', bannerSchem);