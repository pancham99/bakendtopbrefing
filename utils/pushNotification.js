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
    const notificationTitle = title || 'Top Briefing News Update';
    const notificationBody = cleanDescription || 'Read the latest story on Top Briefing.';

    console.log(`[FCM] Preparing push notification for ${tokens.length} subscriber(s)...`);

    // Chunk tokens into batches of 500 (FCM Multicast limit)
    const CHUNK_SIZE = 500;
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const invalidTokens = [];

    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      const tokenBatch = tokens.slice(i, i + CHUNK_SIZE);

      const messagePayload = {
        tokens: tokenBatch,
        notification: {
          title: notificationTitle,
          body: notificationBody,
          imageUrl: cleanImage
        },
        data: {
          newsId: String(newsId || ''),
          slug: String(slug || ''),
          url: articleUrl,
          title: notificationTitle,
          image: cleanImage,
          body: notificationBody
        },
        webpush: {
          headers: {
            Urgency: 'high',
            TTL: '86400'
          },
          notification: {
            title: notificationTitle,
            body: notificationBody,
            icon: logoUrl,
            badge: logoUrl,
            image: cleanImage,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
              url: articleUrl,
              newsId: String(newsId || ''),
              slug: String(slug || '')
            }
          },
          fcmOptions: {
            link: articleUrl
          }
        },
        android: {
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notificationTitle,
                body: notificationBody
              },
              sound: 'default',
              'mutable-content': 1
            }
          },
          fcmOptions: {
            imageUrl: cleanImage
          }
        }
      };

      const response = await messaging.sendEachForMulticast(messagePayload);
      totalSuccessCount += response.successCount;
      totalFailureCount += response.failureCount;

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokenBatch[idx]);
            }
          }
        });
      }
    }

    console.log(`[FCM] Notification summary -> Sent successfully: ${totalSuccessCount}, Failures: ${totalFailureCount}`);

    // Clean up invalid / unregistered tokens from DB
    if (invalidTokens.length > 0) {
      console.log(`[FCM] Pruning ${invalidTokens.length} expired/unregistered FCM token(s)...`);
      await subscriberModel.deleteMany({ fcmToken: { $in: invalidTokens } });
    }

    return {
      success: true,
      sentCount: totalSuccessCount,
      failedCount: totalFailureCount,
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

