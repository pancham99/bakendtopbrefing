const authModel = require('../models/authModel');
// const bcrypt = require('bcrypt');
const { formidable } = require('formidable');
const cloudinary = require('cloudinary').v2;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { mongo: { ObjectId } } = require('mongoose');

const moment = require('moment');

class authController {
    login = async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({ message: 'Please enter all fields' });
        }

        try {
            const user = await authModel.findOne({ email }).select('+password +status');
            if (user.status !== 'active') {
                return res.status(403).json({ message: 'User account is not active' });
            }
            const match = await bcryptjs.compare(password, user.password);
            if (user) {
                if (match) {
                    const obj = {
                        id: user.id,
                        name: user.name,
                        category: user.category,
                        role: user.role,
                    }

                    const token = await jwt.sign(obj, process.env.JWT_SECRET, { expiresIn: process.env.exp_time });

                    return res.status(200).json({ message: 'login success', token ,success: true, });
                } else {
                    return res.status(404).json({ message: 'invailid password' });
                }
            } else {
                return res.status(404).json({ message: 'user not found' });
            }

            // console.log(compare);
            // console.log(user);
        } catch (error) {
            console.log(error);

        }

    }

    add_writer = async (req, res) => {
        const { name, email, password, category, status, } = req.body;

        if (!name || !email || !password || !category) {
            return res.status(404).json({ message: 'please enter all fields' });
        }

        if (email && !email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            return res.status(400).json({ message: 'Please provide a valid email' });
        }


        try {
            const writer = await authModel.findOne({ email: email.trim() });
            if (writer) {
                return res.status(404).json({ message: 'user all ready exit' });
            } else {
                const new_writer = await authModel.create({
                    name: name.trim(),
                    email: email.trim(),
                    password: await bcryptjs.hash(password.trim(), 10),
                    category: category.trim(),
                    role: 'writer',
                    status: status?.trim() || 'active'
                })
                return res.status(201).json({ message: 'writer add success', witer: new_writer });
            }
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' });
        }
    }

  delete_writer = async (req, res) => {
        const { user_id } = req.params;  
        const { role } = req.userInfo;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete writers' });
        }
        try {
            const writer = await authModel.findByIdAndDelete(user_id);   


            if (!writer) {
                return res.status(404).json({ message: 'Writer not found' });
            }   

            return res.status(200).json({ message: 'Writer deleted successfully', writer });
        } catch (error) {   
            console.error("Error in delete_writer:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });    

        }
    }
   

    // get_writers = async(req, res) =>{
    //     try {
    //          const writers = await authModel.find({role:'writer'}).sort({createdAt:-1});
    //          return res.status(200).json({writers});
    //     } catch (error) {
    //         return res.status(500).json({ message: 'internal server error' });
    //     }

    // }

    get_writers = async (req, res) => {
        try {
            const writers = await authModel.find({ role: 'writer' }).sort({ createdAt: -1 });

            if (!writers || writers.length === 0) {
                return res.status(404).json({ message: 'No writers found' });
            }

            return res.status(200).json({ writers });
        } catch (error) {
            console.error("Error in get_writers:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    };

    update_avatar = async (req, res) => {
        const form = formidable({})
        console.log(form, "form")
        const { id } = req.userInfo

        cloudinary.config({
            cloud_name: process.env.CLODINARY_CLOUD_NAME,
            api_key: process.env.CLODINARY_API_KEY,
            api_secret: process.env.CLODINARY_API_SECRET_KEY,
            secure: true
        })


        try {

            const [fields, files] = await form.parse(req)

            let url = files.image[0]
            console.log(url, "url url")

            const data = await cloudinary.uploader.upload(files.image[0].filepath, { folder: 'news_images' })
            url = data.url

            const user = await authModel.findByIdAndUpdate(id, {
                image: url,
            }, { new: true })






            return res.status(200).json({ message: 'Avatar updated successfully', user });
        } catch (error) {
            console.error("Error in update_avatar:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    get_user = async (req, res) => {
        const { id } = req.userInfo;

        try {
            const user = await authModel.findById(id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ user });
        } catch (error) {
            console.error("Error in get_user:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    update_user_status = async (req, res) => {
        const { role } = req.userInfo
        const { user_id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(404).json({ message: 'Please enter status' });
        }

        try {

            if (role !== 'admin') {
                return res.status(403).json({ message: 'You do not have permission to update user status' });
            }
            const user = await authModel.findByIdAndUpdate(user_id, { status }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Status updated successfully', user });
        } catch (error) {
            console.error("Error in update_user_status:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    reset_password = async (req, res) => {
        const { id } = req.userInfo;
        const { email, old_password, new_password } = req.body;
        

        if (!email || !old_password || !new_password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        try {
            // Find the user by email and select password field
            const user = await authModel.findOne({ email }).select('+password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Ensure the request is made by the logged-in user
            if (String(user._id) !== String(id)) {
                return res.status(403).json({ message: 'Unauthorized request' });
            }

            // Check if the old password matches
            const match = await bcryptjs.compare(old_password, user.password);
            if (!match) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            // Hash the new password
            const hashPassword = await bcryptjs.hash(new_password, 10);

            // Update the password
            await authModel.findByIdAndUpdate(user._id, {
                password: hashPassword
            });

            return res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error("Error in reset_password:", error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    



}
module.exports = new authController();