const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TokenUtils = require('../utils/token.utils');

class AuthMiddleware {
    // Protect routes - require authentication
    static async protect(req, res, next) {
        try {
            // 1. Get token from header
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login to access this resource'
                });
            }

            // 2. Verify token
            const decoded = TokenUtils.verifyAccessToken(token);

            // 3. Check if user still exists
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                });
            }

            // 4. Check if user is active
            if (!user.isActive || user.isSuspended) {
                return res.status(401).json({
                    success: false,
                    message: user.isSuspended ? 
                        'Your account has been suspended' : 
                        'Your account is not active'
                });
            }

            // 5. Check if password was changed after token was issued
            if (user.lastPasswordChange) {
                const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
                if (user.lastPasswordChange > tokenIssuedAt) {
                    return res.status(401).json({
                        success: false,
                        message: 'Password was recently changed. Please login again'
                    });
                }
            }

            // 6. Attach user to request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }

    // Optional authentication - attach user if token exists
    static async optional(req, res, next) {
        try {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (token) {
                const decoded = TokenUtils.verifyAccessToken(token);
                const user = await User.findById(decoded.userId);
                
                if (user && user.isActive && !user.isSuspended) {
                    req.user = user;
                }
            }
            next();
        } catch (error) {
            next();
        }
    }

    // Check if user is verified
    static async isVerified(req, res, next) {
        if (!req.user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email to access this resource'
            });
        }
        next();
    }

    // Check if user has 2FA enabled
    static async require2FA(req, res, next) {
        if (!req.user.twoFactorEnabled) {
            return res.status(403).json({
                success: false,
                message: 'Two-factor authentication is required for this action'
            });
        }
        next();
    }

    // Rate limiting for authentication attempts
    static async checkLoginAttempts(req, res, next) {
        const { email } = req.body;
        
        if (!email) return next();
        
        try {
            const user = await User.findOne({ email }).select('+loginAttempts +lockUntil');
            
            if (user && user.isLocked) {
                const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
                return res.status(429).json({
                    success: false,
                    message: `Account is locked. Try again in ${remainingTime} minutes`
                });
            }
            
            req.lockedUser = user;
            next();
        } catch (error) {
            next();
        }
    }
}

module.exports = AuthMiddleware;