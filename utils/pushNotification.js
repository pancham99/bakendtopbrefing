const { getMessaging } = require('./firebaseAdmin');
const subscriberModel = require('../models/subscriberModel');

/**
 * Send push notification to all FCM subscribers for a news article.
 * @param {Object} payload
 * @param {string} payload.title - News title
 * @param {string} [payload.description] - Short description or snippet
 * @param {string} [payload.slug] - Article slug
 * @param {string} [payload.image] - Article image URL
 * @param {string} [payload.newsId] - Article ID
 * @param {string} [payload.targetUrl] - Full URL to article
 */
const sendNewsPushNotification = async ({ title, description = '', slug = '', image = '', newsId = '', targetUrl = '' }) => {
  try {
    const messaging = getMessaging();
    if (!messaging) {
      console.warn('[FCM] Firebase Messaging is not initialized. Skipping push notification.');
      return { success: false, reason: 'FCM not initialized', sentCount: 0 };
    }

    // Find all subscribers with FCM token
    const subscribers = await subscriberModel.find({ fcmToken: { $exists: true, $ne: null, $ne: '' } }, 'fcmToken');
    if (!subscribers || subscribers.length === 0) {
      console.log('[FCM] No FCM subscribers found in database.');
      return { success: true, sentCount: 0, message: 'No push subscribers available' };
    }

    const tokens = subscribers.map(s => s.fcmToken).filter(Boolean);
    if (tokens.length === 0) {
      return { success: true, sentCount: 0, message: 'No valid FCM tokens found' };
    }

    const articleUrl = targetUrl || (slug ? `https://topbriefing.in/news/${slug}` : 'https://topbriefing.in');
    const cleanDescription = (description || '').replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
    const cleanImage = image ? image.replace(/^http:\/\//i, 'https://') : 'https://topbriefing.in/logo.png';
    const logoUrl = 'https://topbriefing.in/logo.png';

    // FCM Multicast payload with full Android & WebPush compatibility
    const messagePayload = {
      tokens: tokens,
      notification: {
        title: title || 'Top Briefing News Update',
        body: cleanDescription || 'Read the latest story on Top Briefing.',
        imageUrl: cleanImage
      },
      data: {
        newsId: String(newsId || ''),
        slug: String(slug || ''),
        url: articleUrl,
        title: title || '',
        image: cleanImage
      },
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '86400'
        },
        notification: {
          title: title || 'Top Briefing News Update',
          body: cleanDescription || 'Read the latest story on Top Briefing.',
          icon: logoUrl,
          badge: logoUrl,
          image: cleanImage,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: articleUrl
        }
      }
    };

    console.log(`[FCM] Sending push notification to ${tokens.length} subscriber(s)...`);
    const response = await messaging.sendEachForMulticast(messagePayload);

    console.log(`[FCM] Sent successfully: ${response.successCount}, Failures: ${response.failureCount}`);

    // Clean up invalid / unregistered tokens from DB
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        console.log(`[FCM] Cleaning up ${invalidTokens.length} stale FCM token(s)...`);
        await subscriberModel.deleteMany({ fcmToken: { $in: invalidTokens } });
      }
    }

    return {
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount,
      totalTokens: tokens.length
    };
  } catch (error) {
    console.error('[FCM] Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNewsPushNotification
};
