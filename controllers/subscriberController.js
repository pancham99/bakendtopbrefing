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
}

module.exports = new subscribeController()