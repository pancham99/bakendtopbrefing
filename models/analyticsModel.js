const { Schema, model } = require("mongoose");

const analyticsSchema = new Schema({

    ip: String,

    browser: String,
    browserVersion: String,

    os: String,
    osVersion: String,

    device: String,
    vendor: String,

    latitude: Number,
    longitude: Number,

    country: String,
    region: String,
    city: String,
    address: String,
    formatAddress: String,

    timezone: String,

    language: String,

    screenWidth: Number,
    screenHeight: Number,

    deviceId: {
        type: String,
        index: true
    },
    deviceName: String,
    visitCount: {
        type: Number,
        default: 1
    },
    lastVisitedAt: {
        type: Date,
        default: Date.now
    },

    referer: String,

}, {
    timestamps: true
});

module.exports = model("Analytics", analyticsSchema);


