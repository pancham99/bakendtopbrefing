// ─────────────────────────────────────────────────────────────
//  utils/redisClient.js
//  Redis connection module using ioredis
// ─────────────────────────────────────────────────────────────

const Redis = require('ioredis');

// ─── WHY TWO SEPARATE CLIENTS? ───────────────────────────────
// Redis ka ek important rule hai:

// Jab ek connection "SUBSCRIBE" mode mein chala jaata hai,
// toh woh connection sirf messages receive kar sakta hai —
// uspe koi aur command (GET, SET, PUBLISH) nahi chala sakte.
//
// Isliye hum 2 alag connections banate hain:
//   1. publishClient  → sirf PUBLISH karne ke liye (admin news approve karta hai)
//   2. subscribeClient → sirf SUBSCRIBE karne ke liye (SSE server sunta hai)
// ─────────────────────────────────────────────────────────────

// ─── SHARED CONFIG ───────────────────────────────────────────
// Dono clients ke liye same Redis config use karenge
const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,

    // ─── RETRY STRATEGY ──────────────────────────────────────
    // Agar Redis band ho ya crash ho jaaye toh app crash na ho.
    // ioredis automatically reconnect karta hai — hum uski
    // timing control karte hain yahan.
    //
    // retryStrategy function ko "times" milta hai —
    // kitni baar retry ho chuki hai.
    // Return value = kitne milliseconds baad dobara try kare.
    // Return null = retry mat karo, give up karo.
    retryStrategy: (times) => {
        // Pehli 10 retries: har 2 second mein try karo
        if (times <= 10) {
            return 2000; // 2 seconds
        }
        // 10 se zyada retries: Redis shayad down hai, stop karo
        // App crash nahi hoga, sirf SSE kaam nahi karega
        console.error('[Redis] Max retry attempts reached. Giving up on reconnect.');
        return null; // null = stop retrying
    },

    // ─── CONNECTION TIMEOUT ──────────────────────────────────
    // 5 second mein connect nahi hua toh error throw karo
    connectTimeout: 5000,

    // ─── LAZY CONNECT ────────────────────────────────────────
    // true = connection tab tak nahi banta jab tak pehla
    // command nahi chalaya. Isse startup fast rehta hai.
    lazyConnect: true
};

// ─── PUBLISH CLIENT ──────────────────────────────────────────
// Yeh client news approve hone par PUBLISH karta hai
const publishClient = new Redis(redisConfig);

publishClient.on('connect', () => {
    console.log('[Redis Publisher] Connected successfully');
});

publishClient.on('error', (err) => {
    // Sirf log karo, app crash mat karo
    // Non-SSE features (news CRUD etc.) normally kaam karte rahenge
    console.error('[Redis Publisher] Error:', err.message);
});

// ─── SUBSCRIBE CLIENT ────────────────────────────────────────
// Yeh client SSE ke liye "news:active" channel ko SUBSCRIBE karta hai
const subscribeClient = new Redis(redisConfig);

subscribeClient.on('connect', () => {
    console.log('[Redis Subscriber] Connected successfully');
});

subscribeClient.on('error', (err) => {
    // Same — sirf log karo
    console.error('[Redis Subscriber] Error:', err.message);
});

module.exports = { publishClient, subscribeClient };
