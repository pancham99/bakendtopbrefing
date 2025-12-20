const mongoose = require('mongoose');

const newsOutletSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    industryLabel: {
        type: String,
        required: true,
        enum: ['BBC', 'CNN', 'NDTV', 'Reuters', 'AP', 'AlJazeera', 'DW', 'Other']
    },
    description: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String,
        default: ''
    },
    bannerUrl: {
        type: String,
        default: ''
    },
    websiteUrl: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    foundedDate: {
        type: Date
    },
    headquarters: {
        type: String
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String
    },
    themeSettings: {
        primaryColor: {
            type: String,
            default: '#1a365d'
        },
        secondaryColor: {
            type: String,
            default: '#2d3748'
        },
        fontFamily: {
            type: String,
            default: 'Inter, sans-serif'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscriptionTiers: [{
        name: String,
        priceMonthly: Number,
        priceYearly: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        features: [String],
        isActive: Boolean
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    editors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reporters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Indexes
newsOutletSchema.index({ slug: 1 }, { unique: true });
newsOutletSchema.index({ industryLabel: 1 });
newsOutletSchema.index({ isActive: 1 });

// Methods
newsOutletSchema.methods.getUserRole = function(userId) {
    if (this.admins.includes(userId)) return 'admin';
    if (this.editors.includes(userId)) return 'editor';
    if (this.reporters.includes(userId)) return 'reporter';
    return null;
};

const NewsOutlet = mongoose.model('NewsOutlet', newsOutletSchema);

module.exports = NewsOutlet;