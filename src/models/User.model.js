const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Password won't be returned in queries by default
    },
    
    // Personal Information
    firstName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'Please enter a valid phone number']
    },
    avatar: {
        url: String,
        publicId: String
    },
    bio: {
        type: String,
        maxlength: 500
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    
    // Location
    country: String,
    city: String,
    timezone: String,
    language: {
        type: String,
        default: 'english',
        enum: ['english', 'hindi', 'bengali', 'marathi', 'telugu', 'tamil', 'urdu', 'gujarati', 'kannada', 'malayalam', 'odia', 'punjabi', 'assamese'   ]
    },
    
    // Authentication & Security
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    
    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Security
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    lastLogin: Date,
    lastPasswordChange: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    
    // Roles & Permissions
    roles: [{
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        },
        outlet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NewsOutlet'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Preferences
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        newsletter: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'light',
            enum: ['light', 'dark', 'auto']
        }
    },
    
    // Activity Tracking
    loginHistory: [{
        ip: String,
        userAgent: String,
        location: String,
        loginAt: {
            type: Date,
            default: Date.now
        },
        success: Boolean
    }],
    
    // Social Logins
    socialProfiles: {
        google: String,
        facebook: String,
        twitter: String,
        github: String
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspensionReason: String,
    suspensionEnds: Date,
    
    // Metadata
    deviceTokens: [{
        token: String,
        platform: {
            type: String,
            enum: ['ios', 'android', 'web']
        },
        lastUsed: Date
    }],
    
    // Statistics
    stats: {
        articlesWritten: {
            type: Number,
            default: 0
        },
        articlesPublished: {
            type: Number,
            default: 0
        },
        commentsCount: {
            type: Number,
            default: 0
        },
        reactionsGiven: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'roles.outlet': 1 });
userSchema.index({ isActive: 1, isSuspended: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save Middleware
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
        
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
        
        // Update last password change
        this.lastPasswordChange = Date.now();
        
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre('save', function(next) {
    // Update timestamps
    if (this.isModified('password')) {
        this.lastPasswordChange = Date.now();
    }
    next();
});

// Instance Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};


userSchema.methods.incrementLoginAttempts = async function () {

    const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const LOCK_TIME = Number(process.env.LOCK_TIME) || (1* 60 * 1000);

    // 🔓 If lock expired → reset
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.loginAttempts = 1;
        this.lockUntil = undefined;
    } else {
        this.loginAttempts += 1;
    }

    // 🔒 Lock account
    if (this.loginAttempts >= MAX_ATTEMPTS) {
        this.lockUntil = Date.now() + LOCK_TIME;
    }

    await this.save();
    return this; // 🔴 IMPORTANT
};

// userSchema.methods.incrementLoginAttempts = async function() {
//     // If we have a previous lock that has expired, reset attempts
//     if (this.lockUntil && this.lockUntil < Date.now()) {
//         return await this.updateOne({
//             $set: { loginAttempts: 1 },
//             $unset: { lockUntil: 1 }
//         });
//     }
    
//     // Otherwise increment
//     const updates = { $inc: { loginAttempts: 1 } };
    
//     // Lock the account if we've reached max attempts
//     if (this.loginAttempts + 1 >= parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5) {
//         updates.$set = { lockUntil: Date.now() + parseInt(process.env.LOCK_TIME) || 15 * 60 * 1000 };
//     }
    
//     return await this.updateOne(updates);
// };

userSchema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
};

// userSchema.methods.resetLoginAttempts = async function() {
//     return await this.updateOne({
//         $set: { loginAttempts: 0 },
//         $unset: { lockUntil: 1 }
//     });
// };

userSchema.methods.getHighestRole = function(outletId = null) {
    let userRoles = this.roles;
    
    if (outletId) {
        userRoles = userRoles.filter(role => 
            role.outlet && role.outlet.toString() === outletId.toString()
        );
    }
    
    if (userRoles.length === 0) return null;
    
    // Populate roles to get level
    return this.model('Role').find({
        '_id': { $in: userRoles.map(r => r.role) }
    }).sort({ level: -1 }).limit(1);
};

userSchema.methods.hasRole = async function(roleName, outletId = null) {
    const roles = await this.populate('roles.role', 'name level');
    
    const userRoles = roles.roles.filter(userRole => {
        const matchesOutlet = !outletId || 
            (userRole.outlet && userRole.outlet.toString() === outletId.toString());
        
        const matchesRole = userRole.role && userRole.role.name === roleName;
        
        return matchesOutlet && matchesRole;
    });
    
    return userRoles.length > 0;
};

userSchema.methods.hasPermission = async function(permission, outletId = null) {
    // Super admin has all permissions
    const isSuperAdmin = await this.hasRole('super_admin');
    if (isSuperAdmin) return true;
    
    // Get user's highest role for the outlet
    const highestRole = await this.getHighestRole(outletId);
    if (!highestRole) return false;
    
    // Check if role has the permission
    return highestRole.permissions.includes(permission) || 
           highestRole.permissions.includes('*');
};

userSchema.methods.generateAuthTokens = function() {
    const User = mongoose.model('User');
    
    const accessToken = require('../utils/token.utils').generateAccessToken({
        userId: this._id,
        email: this.email,
        username: this.username
    });
    
    const refreshToken = require('../utils/token.utils').generateRefreshToken({
        userId: this._id
    });
    
    return { accessToken, refreshToken };
};

// Static Methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email }).select('+password +loginAttempts +lockUntil');
};

userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username }).select('+password +loginAttempts +lockUntil');
};

userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    }).select('+password +loginAttempts +lockUntil');
};


userSchema.methods.getLoginStats = function () {
  const today = new Date();
  today.setHours(0,0,0,0);

  const last = this.loginHistory.at(-1);

  return {
    totalLogins: this.loginHistory.length,
    todayLogins: this.loginHistory.filter(
      l => l.loginAt >= today && l.success
    ).length,
    lastLogin: this.lastLogin,
    lastLoginIP: last?.ip,
    lastLoginDevice: last?.userAgent,
    lastLoginLocation: last?.location
  };
};


const User = mongoose.model('User', userSchema);

module.exports = User;