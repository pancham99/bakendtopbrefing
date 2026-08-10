const subscriberModel = require('../models/subscriberModel');



class subscribeController {
    add_subscriber = async (req, res) => {
        try {
            const email = req.body.email?.trim();
            const fcmToken = req.body.fcmToken;
            const deviceInfo = req.body.deviceInfo;

            // ✅ Check if already subscribed by email or fcmToken
            let existing = null;
            if (email) {
                existing = await subscriberModel.findOne({ email });
            }

            if (existing) {
                if (fcmToken && !existing.fcmToken) {
                    existing.fcmToken = fcmToken;
                    if (deviceInfo) existing.deviceInfo = deviceInfo;
                    await existing.save();
                }
                return res.status(200).json({ message: 'You are already subscribed!', subscriber: existing });
            }

            // ✅ Add new subscriber
            const subscriber = await subscriberModel.create({ email, fcmToken, deviceInfo });

            return res.status(201).json({
                message: 'Subscription successful! You will now receive news updates.',
                subscriber,
            });
        } catch (error) {
            console.error('Error adding subscriber:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    save_fcm_token = async (req, res) => {
        try {
            const { fcmToken, email, deviceInfo } = req.body;
            if (!fcmToken) {
                return res.status(400).json({ message: 'FCM Token is required' });
            }

            let subscriber = await subscriberModel.findOne({ fcmToken });
            if (subscriber) {
                if (email && !subscriber.email) subscriber.email = email;
                if (deviceInfo) subscriber.deviceInfo = deviceInfo;
                await subscriber.save();
            } else if (email) {
                subscriber = await subscriberModel.findOne({ email });
                if (subscriber) {
                    subscriber.fcmToken = fcmToken;
                    if (deviceInfo) subscriber.deviceInfo = deviceInfo;
                    await subscriber.save();
                } else {
                    subscriber = await subscriberModel.create({ email, fcmToken, deviceInfo });
                }
            } else {
                subscriber = await subscriberModel.create({ fcmToken, deviceInfo });
            }

            return res.status(200).json({
                message: 'Push notification token saved successfully',
                subscriber
            });
        } catch (error) {
            console.error('Error saving FCM token:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    get_all_subscribers = async (req, res) => {
        try {
            const subscribers = await subscriberModel.find({}, 'email fcmToken deviceInfo createdAt').sort({ createdAt: -1 });
            const pushSubscriberCount = subscribers.filter(s => !!s.fcmToken).length;
            const emailSubscriberCount = subscribers.filter(s => !!s.email).length;

            return res.status(200).json({
                message: 'All subscribers fetched successfully.',
                count: subscribers.length,
                pushSubscriberCount,
                emailSubscriberCount,
                subscribers,
            });
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            return res.status(500).json({ message: "internal server error" });
        }
    };

    delete_subscriber = async (req, res) => {
        try {
            const { id } = req.params;
            await subscriberModel.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Subscriber deleted successfully' });
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new subscribeController();