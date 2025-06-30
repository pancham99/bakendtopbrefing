const { model, Schema } = require('mongoose');

const advertisementSchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    video: {
        type: String,
        default: ''
    },
    bannerType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'deactive'],
        default: 'pending'
    },
    priority: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date
    },
    dayDuration: {
        type: Number,
        default: 0
    },
    deviceTarget: {
        type: String,
        enum: ['all', 'mobile', 'desktop'],
        default: 'all'
    },
    locationTarget: {
        type: String,
        default: 'all'
    },
    pageTarget: {
        type: String,
        default: 'all'
    },
    placementKey: {
        type: String,
        enum: ['top', 'sidebar', 'bottom', 'middle'],
        default: 'top'
    },
    link: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


advertisementSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model('Advertisement', advertisementSchema);
