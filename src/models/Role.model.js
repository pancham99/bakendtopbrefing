const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        enum: [
            'super_admin',
            'publisher_admin', 
            'editor_in_chief',
            'senior_editor',
            'editor',
            'senior_reporter',
            'reporter',
            'correspondent',
            'contributor',
            'subscriber',
            'reader'
        ]
    },
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    permissions: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ level: -1 });

// Static method to initialize default roles
roleSchema.statics.initializeDefaultRoles = async function() {
    const defaultRoles = [
        {
            name: 'super_admin',
            level: 10,
            description: 'Full system access',
            permissions: ['*']
        },
        {
            name: 'publisher_admin',
            level: 9,
            description: 'Manage publisher content and users',
            permissions: [
                'manage_outlet_users',
                'configure_outlet',
                'view_financials',
                'manage_subscriptions',
                'publish_any_content',
                'manage_advertisements'
            ]
        },
        {
            name: 'editor_in_chief',
            level: 8,
            description: 'Final content approval',
            permissions: [
                'final_approval',
                'assign_editors',
                'set_editorial_calendar',
                'manage_sections',
                'view_analytics'
            ]
        },
        {
            name: 'senior_editor',
            level: 7,
            description: 'Section management',
            permissions: [
                'edit_any_article',
                'approve_content',
                'manage_reporters',
                'schedule_content'
            ]
        },
        {
            name: 'editor',
            level: 6,
            description: 'Content editing and approval',
            permissions: [
                'edit_assigned_articles',
                'review_content',
                'suggest_changes',
                'manage_comments'
            ]
        },
        {
            name: 'senior_reporter',
            level: 5,
            description: 'Lead journalist',
            permissions: [
                'write_articles',
                'submit_for_review',
                'upload_media',
                'view_analytics_own'
            ]
        },
        {
            name: 'reporter',
            level: 4,
            description: 'Content creation',
            permissions: [
                'create_drafts',
                'edit_own_articles',
                'view_assigned_tasks'
            ]
        },
        {
            name: 'correspondent',
            level: 3,
            description: 'Field reporting',
            permissions: [
                'submit_field_reports',
                'upload_field_media'
            ]
        },
        {
            name: 'contributor',
            level: 2,
            description: 'Guest writer',
            permissions: [
                'submit_guest_articles'
            ]
        },
        {
            name: 'subscriber',
            level: 1,
            description: 'Paid access',
            permissions: [
                'read_premium',
                'comment',
                'save_articles',
                'ad_free'
            ]
        },
        {
            name: 'reader',
            level: 0,
            description: 'Basic access',
            permissions: [
                'read_free',
                'comment_limited'
            ]
        }
    ];

    for (const roleData of defaultRoles) {
        const existingRole = await this.findOne({ name: roleData.name });
        if (!existingRole) {
            await this.create(roleData);
            console.log(`✅ Created role: ${roleData.name}`);
        }
    }
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;