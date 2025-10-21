const userModel = require('../models/userModel');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');


class userController {
    register = async (req, res) => {
        try {
            const { name, email, password, location } = req.body;

            const exist = await userModel.findOne({ email });
            if (exist) return res.status(400).json({ message: 'Email already exists' });

            const user = new userModel({ name, email, password, location });
            await user.save();

            const token = generateToken(user);

            res.status(201).json({ user, token });
        } catch (error) {
            res.status(500).json({ message: 'Registration failed', error });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email})
            if (!user) return res.status(404).json({ message: 'User not found' });
            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
            // Generate token
            const token = generateToken(user);
             res.status(200).json({ user, token , message: 'Login successful', success: true, });
        } catch (error) {
            res.status(500).json({ message: 'Login failed', error });
        }

    }

}

module.exports = new userController();
