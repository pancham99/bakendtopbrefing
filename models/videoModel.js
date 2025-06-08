const {model, Schema} = require('mongoose');

const videoSchem = new Schema({
    title: {
        type: String,
    },
    videourl: {
        type: String,
        default: ''
    },
    videos:{
        type: String,
        default: ''
    },
    videotype: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'pending'
    },


}, {timestamps: true});

module.exports = model('video', videoSchem);