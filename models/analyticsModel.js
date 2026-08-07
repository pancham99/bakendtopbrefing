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

    timezone: String,

    language: String,

    screenWidth: Number,
    screenHeight: Number,

    referer: String,

}, {
    timestamps: true
});

module.exports = model("Analytics", analyticsSchema);


