const User = require('../models/User.model');

class RoleMiddleware {
    // Check if user has specific role
    static hasRole(roleName) {
        return async (req, res, next) => {
            try {
                const hasRole = await req.user.hasRole(roleName);
                
                if (!hasRole) {
                    return res.status(403).json({
                        success: false,
                        message: `Access denied. Required role: ${roleName}`
                    });
                }
                
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error checking user role'
                });
            }
        };
    }

    // Check if user has any of the specified roles
    static hasAnyRole(roleNames) {
        return async (req, res, next) => {
            try {
                const roleChecks = await Promise.all(
                    roleNames.map(roleName => req.user.hasRole(roleName))
                );
                
                const hasAnyRole = roleChecks.some(check => check === true);
                
                if (!hasAnyRole) {
                    return res.status(403).json({
                        success: false,
                        message: `Access denied. Required one of these roles: ${roleNames.join(', ')}`
                    });
                }
                
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error checking user roles'
                });
            }
        };
    }

    // Check if user has specific permission
    static hasPermission(permission) {
        return async (req, res, next) => {
            try {
                // Get outlet ID from params or body
                const outletId = req.params.outletId || req.body.outletId;
                
                const hasPermission = await req.user.hasPermission(permission, outletId);
                
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: `Access denied. Required permission: ${permission}`
                    });
                }
                
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error checking user permission'
                });
            }
        };
    }

    // Check if user is outlet admin
    static isOutletAdmin(outletIdParam = 'outletId') {
        return async (req, res, next) => {
            try {
                const outletId = req.params[outletIdParam];
                
                if (!outletId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Outlet ID is required'
                    });
                }
                
                const isAdmin = await req.user.hasRole('publisher_admin', outletId);
                
                if (!isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Outlet admin privileges required'
                    });
                }
                
                next();
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error checking outlet admin status'
                });
            }
        };
    }

    // Check if user is super admin
    static isSuperAdmin(req, res, next) {
        RoleMiddleware.hasRole('super_admin')(req, res, next);
    }

    // Check if user is editor (any level)
    static isEditor(req, res, next) {
        RoleMiddleware.hasAnyRole([
            'editor_in_chief',
            'senior_editor', 
            'editor'
        ])(req, res, next);
    }

    // Check if user is reporter (any level)
    static isReporter(req, res, next) {
        RoleMiddleware.hasAnyRole([
            'senior_reporter',
            'reporter',
            'correspondent'
        ])(req, res, next);
    }

    // Check if user is subscriber or higher
    static isSubscriber(req, res, next) {
        RoleMiddleware.hasAnyRole([
            'super_admin',
            'publisher_admin',
            'editor_in_chief',
            'senior_editor',
            'editor',
            'senior_reporter', 
            'reporter',
            'correspondent',
            'contributor',
            'subscriber'
        ])(req, res, next);
    }
}

module.exports = RoleMiddleware;