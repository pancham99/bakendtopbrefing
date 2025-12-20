const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function createIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const db = mongoose.connection.db;
        
        // User collection indexes
        await db.collection('users').createIndexes([
            { key: { email: 1 }, unique: true, name: 'email_unique' },
            { key: { username: 1 }, unique: true, name: 'username_unique' },
            { key: { 'roles.outlet': 1 }, name: 'outlet_roles' },
            { key: { isActive: 1, isSuspended: 1 }, name: 'active_status' },
            { key: { createdAt: -1 }, name: 'created_at_desc' },
            { key: { emailVerificationToken: 1 }, name: 'email_verification_token' },
            { key: { passwordResetToken: 1 }, name: 'password_reset_token' }
        ]);
        
        // Role collection indexes
        await db.collection('roles').createIndexes([
            { key: { name: 1 }, unique: true, name: 'role_name_unique' },
            { key: { level: -1 }, name: 'role_level_desc' }
        ]);
        
        // NewsOutlet collection indexes
        await db.collection('newsoutlets').createIndexes([
            { key: { slug: 1 }, unique: true, name: 'outlet_slug_unique' },
            { key: { industryLabel: 1 }, name: 'industry_label' },
            { key: { isActive: 1 }, name: 'outlet_active' }
        ]);
        
        console.log('✅ All indexes created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
}

createIndexes();