const jwt = require('jsonwebtoken');
const crypto = require('crypto');


class TokenUtils {
    // Generate Access Token
    static generateAccessToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        )

    }

    // Generate Refresh Token
    static generateRefreshToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        )
    }

    // Verify Access Token
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    // Verify Refresh Token
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    // Generate Random Token
    static generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Generate Email Verification Token
    static generateEmailVerificationToken() {
        return this.generateRandomToken(32);
    }
    // Generate Password Reset Token
    static generatePasswordResetToken() {
        return this.generateRandomToken(32);
    }
    // Generate OTP
    static generateOTP(ength = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }
    // Decode Token without Verification
    static decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = TokenUtils;