const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database.js');


// Import models
const User = require('./models/User.model');
const Role = require('./models/Role.model');
const NewsOutlet = require('./models/NewsOutlet.model');

// Import routes
const authRoutes = require('./routes/auth.routes');

const app = express();



// Connect to MongoDB
connectDB();

// Initialize default data
// async function initializeDefaultData() {
//     try {
//         // Initialize default roles
//         await Role.initializeDefaultRoles();
//         console.log('✅ Default roles initialized');

//         // Create super admin user if not exists
//         const superAdminRole = await Role.findOne({ name: 'super_admin' });
//         const existingSuperAdmin = await User.findOne({ email: 'admin@newsplatform.com' });

//         if (!existingSuperAdmin && superAdminRole) {
//             const superAdmin = await User.create({
//                 email: 'dayalmadhusudan75@gmail.com',
//                 username: 'superadmin',
//                 password: 'Admin@123456', // Change this in production
//                 firstName: 'Super',
//                 lastName: 'Admin',
//                 isEmailVerified: true,
//                 roles: [{
//                     role: superAdminRole._id,
//                     assignedAt: Date.now()
//                 }]
//             });
//             console.log('✅ Super admin created:', superAdmin.email);
//         }
//     } catch (error) {
//         console.error('❌ Error initializing default data:', error);
//     }
// }

app.use(helmet());
app.use(cors({
    // origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);


// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
//   await initializeDefaultData();

});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;