const subscriberModel = require('../models/subscriberModel');



class subscribeController {
    add_subscriber = async (req, res) => {
        try {
            const email = req.body.email?.trim()?.toLowerCase() || null;
            const fcmToken = req.body.fcmToken?.trim() || null;
            const deviceInfo = req.body.deviceInfo || null;

            if (!email && !fcmToken) {
                return res.status(400).json({ message: 'Email or Push Notification token is required' });
            }

            // Check if already subscribed by email or fcmToken
            let existing = null;
            if (email) {
                existing = await subscriberModel.findOne({ email });
            }
            if (!existing && fcmToken) {
                existing = await subscriberModel.findOne({ fcmToken });
            }

            if (existing) {
                let updated = false;
                if (email && !existing.email) {
                    existing.email = email;
                    updated = true;
                }
                if (fcmToken && existing.fcmToken !== fcmToken) {
                    existing.fcmToken = fcmToken;
                    updated = true;
                }
                if (deviceInfo) {
                    existing.deviceInfo = deviceInfo;
                    updated = true;
                }
                if (updated) await existing.save();
                return res.status(200).json({ message: 'You are already subscribed!', subscriber: existing });
            }

            // Create new subscriber record
            const subscriber = await subscriberModel.create({
                ...(email ? { email } : {}),
                ...(fcmToken ? { fcmToken } : {}),
                ...(deviceInfo ? { deviceInfo } : {})
            });

            return res.status(201).json({
                message: 'Subscription successful! You will now receive news updates.',
                subscriber,
            });
        } catch (error) {
            console.error('Error adding subscriber:', error);
            if (error.code === 11000) {
                return res.status(200).json({ message: 'You are already subscribed!' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    save_fcm_token = async (req, res) => {
        try {
            const { fcmToken, email, deviceInfo } = req.body;
            if (!fcmToken) {
                return res.status(400).json({ message: 'FCM Token is required' });
            }

            const cleanEmail = email?.trim()?.toLowerCase() || null;
            const cleanToken = fcmToken.trim();

            let subscriber = await subscriberModel.findOne({ fcmToken: cleanToken });
            if (!subscriber && cleanEmail) {
                subscriber = await subscriberModel.findOne({ email: cleanEmail });
            }

            if (subscriber) {
                subscriber.fcmToken = cleanToken;
                if (cleanEmail) subscriber.email = cleanEmail;
                if (deviceInfo) subscriber.deviceInfo = deviceInfo;
                await subscriber.save();
            } else {
                subscriber = await subscriberModel.create({
                    fcmToken: cleanToken,
                    ...(cleanEmail ? { email: cleanEmail } : {}),
                    ...(deviceInfo ? { deviceInfo } : {})
                });
            }

            return res.status(200).json({
                message: 'Push notification token saved successfully',
                subscriber
            });
        } catch (error) {
            console.error('Error saving FCM token:', error);
            if (error.code === 11000) {
                return res.status(200).json({ message: 'Push notification token registered successfully' });
            }
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