const User = require('../models/User.model');
const Role = require('../models/Role.model');
const TokenUtils = require('../utils/token.utils');
const PasswordUtils = require('../utils/password.utils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');
const geoip = require('geoip-lite');


class AuthController {
    // Register User
    static async register(req, res) {
        try {
            const { email, username, password, firstName, lastName, phone } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.email === email ?
                        'Email already registered' :
                        'Username already taken'
                });
            }

            // Validate password strength
            const passwordValidation = PasswordUtils.validatePasswordStrength(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Password is too weak',
                    errors: passwordValidation.errors
                });
            }

            // Get reader role
            const readerRole = await Role.findOne({ name: 'reader' });
            if (!readerRole) {
                return res.status(500).json({
                    success: false,
                    message: 'System configuration error'
                });
            }

            // Create user
            const user = await User.create({
                email,
                username,
                password,
                firstName,
                lastName,
                phone,
                roles: [{
                    role: readerRole._id,
                    assignedAt: Date.now()
                }],
                emailVerificationToken: TokenUtils.generateEmailVerificationToken(),
                emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });

            // Generate tokens
            const tokens = user.generateAuthTokens();

            // Remove sensitive data
            user.password = undefined;
            user.loginAttempts = undefined;
            user.lockUntil = undefined;

            // TODO: Send verification email
            await sendVerificationEmail(user.email, user.emailVerificationToken);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify your email.',
                data: {
                    user,
                    tokens
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Login User
    // static async login(req, res) {
    //     try {
    //         const { email, password, rememberMe } = req.body;

    //         // 1. Check if email/username and password exist
    //         if (!email || !password) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Please provide email/username and password'
    //             });
    //         }

    //         // 2. Find user
    //         const user = await User.findByEmailOrUsername(email);
    //         if (!user) {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: 'Invalid credentials'
    //             });
    //         }

    //         // 3. Check if account is locked
    //         if (user.isLocked) {
    //             const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    //             return res.status(429).json({
    //                 success: false,
    //                 message: `Account is locked. Try again in ${remainingTime} minutes`
    //             });
    //         }

    //         // 4. Check if account is active
    //         if (!user.isActive) {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: 'Your account is deactivated'
    //             });
    //         }

    //         // check if email is verified
    //         if (!user.isEmailVerified) {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: 'Please verify your email to login'
    //             });
    //         }

    //         // 5. Check password
    //         const isPasswordCorrect = await user.comparePassword(password);
    //         if (!isPasswordCorrect) {
    //             // Increment login attempts
    //             await user.incrementLoginAttempts();

    //             const attemptsLeft = (process.env.MAX_LOGIN_ATTEMPTS || 5) - (user.loginAttempts + 1);

    //             return res.status(401).json({
    //                 success: false,
    //                 message: `Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempts left` : 'Account locked'}`
    //             });
    //         }

    //         // 6. Reset login attempts
    //         await user.resetLoginAttempts();

    //         // 7. Update last login
    //         user.lastLogin = Date.now();
    //         await user.save();

    //         // 8. Generate tokens
    //         const tokens = user.generateAuthTokens();

    //         // 9. Remove sensitive data
    //         user.password = undefined;
    //         user.loginAttempts = undefined;
    //         user.lockUntil = undefined;

    //         // 10. Set refresh token in cookie if rememberMe is true
    //         if (rememberMe) {
    //             res.cookie('refreshToken', tokens.refreshToken, {
    //                 httpOnly: true,
    //                 secure: process.env.NODE_ENV === 'production',
    //                 sameSite: 'strict',
    //                 maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    //             });
    //         }

    //         res.status(200).json({
    //             success: true,
    //             message: 'Login successful',
    //             data: {
    //                 user,
    //                 accessToken: tokens.accessToken,
    //                 refreshToken: rememberMe ? undefined : tokens.refreshToken
    //             }
    //         });
    //     } catch (error) {
    //         console.error('Login error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Login failed',
    //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
    //         });
    //     }
    // }

    // update login method is in auth.middleware.js

    static async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email/username and password'
                });
            }

            const user = await User.findByEmailOrUsername(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            if (user.isLocked) {
                const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
                return res.status(429).json({
                    success: false,
                    message: `Account is locked. Try again in ${remainingTime} minutes`
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Your account is deactivated'
                });
            }

            // if (!user.isEmailVerified) {
            //     return res.status(401).json({
            //         success: false,
            //         message: 'Please verify your email to login'
            //     });
            // }

            const isPasswordCorrect = await user.comparePassword(password);
            if (!isPasswordCorrect) {
                await user.incrementLoginAttempts();

                const attemptsLeft =
                    (process.env.MAX_LOGIN_ATTEMPTS || 5) - (user.loginAttempts + 1);

                return res.status(401).json({
                    success: false,
                    message: `Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempts left` : 'Account locked'
                        }`
                });
            }

            // ✅ Reset attempts
            await user.resetLoginAttempts();

            // ===============================
            // 🔥 LOGIN TRACKING STARTS HERE
            // ===============================

            const ip =
                req.headers['x-forwarded-for']?.split(',')[0] ||
                req.socket.remoteAddress;

            const geo = geoip.lookup(ip);

            user.lastLogin = new Date();

            user.loginHistory.push({
                ip,
                userAgent: req.headers['user-agent'],
                location: geo ? `${geo.city || ''}, ${geo.country}` : 'Unknown',
                success: true
            });

            // 🔒 Limit login history to last 20
            if (user.loginHistory.length > 20) {
                user.loginHistory = user.loginHistory.slice(-20);
            }

            await user.save();

            // ===============================
            // 🔥 LOGIN TRACKING ENDS HERE
            // ===============================

            const tokens = user.generateAuthTokens();

            user.password = undefined;
            user.loginAttempts = undefined;
            user.lockUntil = undefined;

            if (rememberMe) {
                res.cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
            }

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: rememberMe ? undefined : tokens.refreshToken
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }



    // Logout User
    static async logout(req, res) {
        try {
            // Clear refresh token cookie
            res.clearCookie('refreshToken');

            // Invalidate token (you might want to implement a token blacklist)

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }

    // Refresh Token
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }

            // Verify refresh token
            const decoded = TokenUtils.verifyRefreshToken(refreshToken);

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive || user.isSuspended) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            // Generate new tokens
            const tokens = user.generateAuthTokens();

            res.status(200).json({
                success: true,
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }
    }

    // Verify Email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification token is required'
                });
            }

            // Find user with this token and check expiration
            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token'
                });
            }

            // Mark email as verified
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Email verification failed'
            });
        }
    }

    // Forgot Password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: 'If email exists, password reset instructions will be sent'
                });
            }

            // Generate reset token
            const resetToken = TokenUtils.generatePasswordResetToken();

            // Set token and expiry
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
            await user.save();

            // TODO: Send password reset email
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await sendPasswordResetEmail(user.email, resetUrl);

            res.status(200).json({
                success: true,
                message: 'Password reset instructions sent to email'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Password reset request failed'
            });
        }
    }

    // Reset Password
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Find user with valid reset token
            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Validate new password
            const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Password is too weak',
                    errors: passwordValidation.errors
                });
            }

            // Update password
            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.lastPasswordChange = Date.now();
            await user.save();

            // TODO: Send password changed notification email

            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Password reset failed'
            });
        }
    }

    // Change Password (authenticated)
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.id).select("+password");
            // Check current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password
            const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'New password is too weak',
                    errors: passwordValidation.errors
                });
            }

            // Update password
            req.user.password = newPassword;
            await req.user.save();

            // TODO: Send password changed notification

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Password change failed'
            });
        }
    }

    // Get Current User Profile
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id)
                .select('-password -loginAttempts -lockUntil -twoFactorSecret')
                .populate('roles.role', 'name level description');

            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile'
            });
        }
    }

    // Update Profile
    static async updateProfile(req, res) {
        try {
            const updates = req.body;

            // Remove fields that shouldn't be updated directly
            delete updates.password;
            delete updates.email;
            delete updates.roles;
            delete updates.isActive;
            delete updates.isSuspended;

            // Update user
            const user = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            ).select('-password -loginAttempts -lockUntil -twoFactorSecret');

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Profile update failed'
            });
        }
    }

    // Delete Account
    static async deleteAccount(req, res) {
        try {
            const { password } = req.body;

            // Verify password
            const isMatch = await req.user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Password is incorrect'
                });
            }

            // Soft delete (deactivate)
            req.user.isActive = false;
            req.user.deactivatedAt = Date.now();
            await req.user.save();

            // TODO: Send account deactivation email

            res.status(200).json({
                success: true,
                message: 'Account deactivated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Account deactivation failed'
            });
        }
    }

    // Check Username Availability
    static async checkUsername(req, res) {
        try {
            const { username } = req.query;

            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            const user = await User.findOne({ username });

            res.status(200).json({
                success: true,
                data: {
                    available: !user,
                    suggestions: user ? this.generateUsernameSuggestions(username) : []
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Username check failed'
            });
        }
    }

    // Helper: Generate username suggestions
    static generateUsernameSuggestions(baseUsername) {
        const suggestions = [];
        for (let i = 1; i <= 5; i++) {
            suggestions.push(`${baseUsername}${i}`);
            suggestions.push(`${baseUsername}_${i}`);
            suggestions.push(`${baseUsername}${Math.floor(Math.random() * 1000)}`);
        }
        return [...new Set(suggestions)].slice(0, 5);
    }

    // Admin: Get all users (paginated)
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const users = await User.find()
                .select('-password -loginAttempts -lockUntil -twoFactorSecret')
                .skip(skip)
                .limit(limit)
                .sort('-createdAt');

            const total = await User.countDocuments();

            res.status(200).json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }

    // Admin: Update user role
    static async updateUserRole(req, res) {
        try {
            const { userId } = req.body;
            const { roleId } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Check if user already has this role for this outlet
            const existingRole = user.roles.find(r =>
                r.role.toString() === roleId
            );

            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'User already has this role for this outlet'
                });
            }

            // Add new role
            user.roles.push({
                role: role._id,
                // outlet: outletId || null,
                assignedAt: Date.now(),
                assignedBy: req.user._id
            });

            await user.save();

            res.status(200).json({
                success: true,
                message: 'User role updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update user role'
            });
        }
    }

    // Admin: Get all roles
    static async getAllRoles(req, res) {
        try {
            const roles = await Role.find().select('-__v');

            res.status(200).json({
                success: true,
                data: { roles }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch roles'
            });
        }
    }

    // updateProfile complete details after registr rest detils

    static async completeProfile(req, res) {
        try {
            const updates = req.body;
            // Update user
            const user = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            ).select('-password -loginAttempts -lockUntil -twoFactorSecret');
            res.status(200).json({
                success: true,
                message: 'Profile completed successfully',
                data: { user }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Profile completion failed'
            });
        }
    }

    // Admin: Create new role
    static async createRole(req, res) {
        try {
            const { name, level, description } = req.body;

            // Check if role already exists
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Role already exists'
                });
            }

            // Create new role
            const role = await Role.create({ name, level, description });

            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: { role }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create role'
            });
        }
    }

    // Admin: Update role
    static async updateRole(req, res) {
        try {
            const { roleId, name, level, description } = req.body;

            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Update role details
            role.name = name || role.name;
            role.level = level || role.level;
            role.description = description || role.description;

            await role.save();

            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                data: { role }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update role'
            });
        }
    }

    // Admin: Delete role
    static async deleteRole(req, res) {
        try {
            const { roleId } = req.body;

            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Check if role is assigned to any user
            const usersWithRole = await User.countDocuments({ 'roles.role': roleId });
            if (usersWithRole > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete role assigned to users'
                });
            }

            await role.remove();

            res.status(200).json({
                success: true,
                message: 'Role deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete role'
            });
        }
    }

    // getuserdetails
// Admin: get any user details by ID
static async getUserDetails(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('roles.role', 'name permissions level')
      .select('-password -loginAttempts -lockUntil -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },   // ✅ only this user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get user details',
    });
  }
}



}

module.exports = AuthController;