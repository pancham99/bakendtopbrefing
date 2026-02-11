const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const RoleMiddleware = require('../middleware/role.middleware');
const { body, query, param } = require('express-validator');




// Protected Routes (Authentication Required)
router.use(AuthMiddleware.protect);



// 🔐 AUTH REQUIRED
router.use(AuthMiddleware.protect);

// 🔐 SUPER ADMIN ONLY
router.use(RoleMiddleware.isSuperAdmin);

// Admin Routes
router.use(RoleMiddleware.isSuperAdmin);

// getuserdetails



module.exports = router;