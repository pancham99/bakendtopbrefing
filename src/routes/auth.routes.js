const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const RoleMiddleware = require('../middleware/role.middleware');
const { body, query, param } = require('express-validator');

// Public Routes
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('username').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
        body('password').isLength({ min: 8 }),
        body('firstName').optional().trim().notEmpty(),
        body('lastName').optional().trim().notEmpty(),
        body('phone').optional().matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)
    ],
    AuthController.register
);

router.post(
    '/login',
    [
        body('email').notEmpty(),
        body('password').notEmpty()
    ],
    AuthMiddleware.checkLoginAttempts,
    AuthController.login
);

router.post('/refresh-token', AuthController.refreshToken);

router.get('/verify-email', 
    query('token').notEmpty(),
    AuthController.verifyEmail
);

router.post('/forgot-password',
    body('email').isEmail(),
    AuthController.forgotPassword
);

router.post('/reset-password',
    [
        body('token').notEmpty(),
        body('newPassword').isLength({ min: 8 })
    ],
    AuthController.resetPassword
);

router.get('/check-username',
    query('username').isLength({ min: 3 }),
    AuthController.checkUsername
);

// Protected Routes (Authentication Required)
router.use(AuthMiddleware.protect);

router.post('/logout', AuthController.logout);

router.post('/change-password',
    [
        body('currentPassword').notEmpty(),
        body('newPassword').isLength({ min: 8 })
    ],
    AuthController.changePassword
);

router.get('/profile', AuthController.getProfile);

router.put('/updateprofile',
    // [
    //     body('firstName').optional().trim().notEmpty(),
    //     body('lastName').optional().trim().notEmpty(),
    //     body('phone').optional().matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
    //     body('bio').optional().trim(),
    //     body('country').optional().trim(),
    //     body('city').optional().trim(),
    //     body('language').optional().isIn(['en', 'hi', 'es', 'fr', 'de', 'zh'])
    // ],
    AuthController.updateProfile
);

router.delete('/account',
    body('password').notEmpty(),
    AuthController.deleteAccount
);

// 🔐 AUTH REQUIRED
router.use(AuthMiddleware.protect);

// 🔐 SUPER ADMIN ONLY
router.use(RoleMiddleware.isSuperAdmin);

// ✅ ADMIN: get any user details
router.get('/users/:userId', AuthController.getUserDetails);
// Admin Routes
router.use(RoleMiddleware.isSuperAdmin);

// getuserdetails


router.get('/admin/users', AuthController.getAllUsers);

router.get('/admin/all/roles', AuthController.getAllRoles);

router.post('/admin/users/roleupdate',
    [
        param('userId').isMongoId(),
        body('roleId').isMongoId(),
        // body('outletId').optional().isMongoId()
    ],
    AuthController.updateUserRole
);

module.exports = router;