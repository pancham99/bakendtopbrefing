const authModel = require('../models/authModel');
// const bcrypt = require('bcrypt');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

class authController {
    login = async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({ message: 'Please enter all fields' });
        }

        try {
            const user = await authModel.findOne({ email }).select('+password');
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

                    return res.status(200).json({ message: 'login success', token });
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
        const { name, email, password, category } = req.body;

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
                    role: 'writer'
                })
                return res.status(201).json({ message: 'writer add success', witer: new_writer });
             }
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' });
        }
    }

    get_writers = async(req, res) =>{
        try {
             const writers = await authModel.find({role:'writer'}).sort({createdAt:-1});
             return res.status(200).json({writers});
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' });
        }

    }

}
module.exports = new authController();