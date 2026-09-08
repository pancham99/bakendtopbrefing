const subscriberModel = require('../models/subscriberModel');

// Helper to remove explicit null fields from legacy DB records so sparse indexes function properly
const cleanupLegacyNulls = async () => {
    try {
        await subscriberModel.updateMany({ fcmToken: null }, { $unset: { fcmToken: 1 } });
        await subscriberModel.updateMany({ email: null }, { $unset: { email: 1 } });
    } catch (e) {
        console.warn('Subscriber legacy null cleanup notice:', e.message);
    }
};

class subscribeController {
    add_subscriber = async (req, res) => {
        try {
            await cleanupLegacyNulls();
            const email = req.body.email?.trim()?.toLowerCase() || undefined;
            const fcmToken = req.body.fcmToken?.trim() || undefined;
            const deviceInfo = req.body.deviceInfo || undefined;

            if (!email && !fcmToken) {
                return res.status(400).json({ message: 'Email or Push Notification token is required' });
            }

            // Check existing by fcmToken if token provided, else by email
            let existing = null;
            if (fcmToken) {
                existing = await subscriberModel.findOne({ fcmToken });
            } else if (email) {
                existing = await subscriberModel.findOne({ email });
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

            // Create new subscriber record (only include non-undefined fields)
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
            await cleanupLegacyNulls();
            const { fcmToken, email, deviceInfo } = req.body;
            if (!fcmToken || typeof fcmToken !== 'string' || !fcmToken.trim()) {
                return res.status(400).json({ message: 'FCM Token is required' });
            }

            const cleanToken = fcmToken.trim();
            const cleanEmail = (email && typeof email === 'string') ? email.trim().toLowerCase() : undefined;

            // 1. Check if record already exists for this FCM token (same device)
            let subscriber = await subscriberModel.findOne({ fcmToken: cleanToken });

            if (subscriber) {
                let updated = false;
                if (cleanEmail && subscriber.email !== cleanEmail) {
                    subscriber.email = cleanEmail;
                    updated = true;
                }
                if (deviceInfo) {
                    subscriber.deviceInfo = deviceInfo;
                    updated = true;
                }
                if (updated) await subscriber.save();
            } else {
                // 2. Check if an email-only subscriber exists (no FCM token assigned yet)
                if (cleanEmail) {
                    const emailOnlySub = await subscriberModel.findOne({ email: cleanEmail, fcmToken: { $exists: false } });
                    if (emailOnlySub) {
                        subscriber = emailOnlySub;
                        subscriber.fcmToken = cleanToken;
                        if (deviceInfo) subscriber.deviceInfo = deviceInfo;
                        await subscriber.save();
                    }
                }

                // 3. If still no subscriber, create a dedicated record for this device's token
                if (!subscriber) {
                    subscriber = await subscriberModel.create({
                        fcmToken: cleanToken,
                        ...(cleanEmail ? { email: cleanEmail } : {}),
                        ...(deviceInfo ? { deviceInfo } : {})
                    });
                }
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