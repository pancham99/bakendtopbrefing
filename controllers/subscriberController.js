const subscriberModel = require('../models/subscriberModel');



class subscribeController {
    add_subscriber = async (req, res) => {
        try {
            const email = req.body.email?.trim();
            // // ✅ Check if already subscribed
            const existing = await subscriberModel.findOne({ email });
            if (existing) {
                return res.status(200).json({ message: 'You are already subscribed!' });
            }

            // ✅ Add new subscriber
            const subscriber = await subscriberModel.create({ email });

            return res.status(201).json({
                message: 'Subscription successful! You will now receive news updates.',
                subscriber,
            });
        } catch (error) {
            console.error('Error adding subscriber:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    get_all_subscribers = async (req, res) => {
        try {

            const subscribers = await subscriberModel.find({}, 'email createdAt')
            return res.status(200).json({
                message: 'All subscribers fetched successfully.',
                count: subscribers.length,
                subscribers,
            });

        } catch (error) {

            console.error('Error fetching subscribers:', error);
            return res.status(500).json({ message: "internal server error" })

        }

    }
}

module.exports = new subscribeController()