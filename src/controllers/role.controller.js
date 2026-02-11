const User = require('../models/User.model');
const Role = require('../models/Role.model');

const geoip = require('geoip-lite');

class RoleController {
   
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





}

module.exports = RoleController;