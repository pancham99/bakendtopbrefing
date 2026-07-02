// ─────────────────────────────────────────────────────────────
//  routes/sseRouters.js
//  Server-Sent Events (SSE) endpoint for real-time news updates
// ─────────────────────────────────────────────────────────────

// ─── WHAT IS SSE? ────────────────────────────────────────────
// SSE (Server-Sent Events) ek simple protocol hai jisme:
//   - Client ek HTTP connection open karta hai
//   - Server us connection ko OPEN rakhta hai
//   - Jab bhi server chahey, woh data push kar sakta hai
//   - WebSocket se alag — yeh sirf ONE-WAY hai (server → client)
//   - News delivery ke liye perfect: client sirf receive karta hai
// ─────────────────────────────────────────────────────────────

const router = require('express').Router();
const { subscribeClient } = require('../utils/redisClient');

// ─── CONNECTED CLIENTS MAP ───────────────────────────────────
// Map<clientId, response_object>
//
// Hum yahan sab connected users ko track karte hain.
// Jab bhi Redis se message aata hai, hum is Map ko loop karte hain
// aur har ek connected client ko message bhejte hain.
//
// WHY Map instead of Array?
// Map mein client ID se directly O(1) mein access aur delete kar sakte hain.
// Array mein delete ke liye poora traverse karna padta.
// ─────────────────────────────────────────────────────────────
const connectedClients = new Map();

// ─── REDIS SUBSCRIBE (ONLY ONCE AT STARTUP) ──────────────────
// IMPORTANT: Yeh subscribe call SIRF EK BAAR hota hai —
// server start hone par. Har client ke liye alag subscribe
// nahi hota. Yeh efficient hai kyunki:
//   - Redis pe sirf 1 subscription connection hai
//   - Chahe 1000 clients connected hon, Redis ko sirf 1 baar message bhejta hai
//   - Hum apne app level pe woh message sab clients ko distribute karte hain
//
// HORIZONTAL SCALING NOTE:
// Agar hum 3 Node.js instances chalayein (load balancer ke peeche),
// toh har instance ka apna subscribeClient hoga, aur har instance
// "news:active" channel ko subscribe karega.
// Jab admin kisi bhi instance pe news approve kare aur PUBLISH kare,
// Redis woh message TEENO instances ko deliver karega.
// Isse connected clients chahe kisi bhi server pe hon — sabko
// real-time update milega. Yehi Redis Pub/Sub ki power hai.
// ─────────────────────────────────────────────────────────────
const initRedisSubscriber = () => {
    subscribeClient.subscribe('news:active', (err, count) => {
        if (err) {
            // Redis down hai — SSE kaam nahi karega lekin app chalega
            console.error('[SSE] Failed to subscribe to Redis channel:', err.message);
            return;
        }
        console.log(`[SSE] Subscribed to 'news:active' channel. Active subscriptions: ${count}`);
    });

    // Jab Redis se message aaye "news:active" channel pe
    subscribeClient.on('message', (channel, message) => {
        if (channel !== 'news:active') return; // sirf apne channel ka message process karo

        console.log(`[SSE] New message on channel '${channel}'. Broadcasting to ${connectedClients.size} clients.`);

        // Sab connected clients ko broadcast karo
        connectedClients.forEach((clientRes, clientId) => {
            try {
                // ─── SSE MESSAGE FORMAT ───────────────────────────────
                // SSE ka specific format hai:
                //   event: <event-name>\n
                //   data: <JSON string>\n\n
                //
                // Frontend mein EventSource "news:active" event
                // naam se listen karega — default "message" se nahi.
                // Double \n\n ek message ka end batata hai.
                // ─────────────────────────────────────────────────────
                clientRes.write(`event: news:active\ndata: ${message}\n\n`);
            } catch (writeErr) {
                // Client disconnect ho gaya lekin event nahi aaya
                // Cleanup karo
                console.error(`[SSE] Error writing to client ${clientId}:`, writeErr.message);
                connectedClients.delete(clientId);
            }
        });
    });
};

// ─── SSE ENDPOINT ────────────────────────────────────────────
// GET /api/news/stream
// Frontend is URL pe connect karega EventSource ke through
// ─────────────────────────────────────────────────────────────
router.get('/api/news/stream', (req, res) => {

    // ─── SSE HEADERS ─────────────────────────────────────────
    // Yeh headers browser ko batate hain ke yeh SSE connection hai:
    //   Content-Type: text/event-stream → SSE protocol
    //   Cache-Control: no-cache → browser/proxy cache na kare
    //   Connection: keep-alive → connection band mat karo
    //   X-Accel-Buffering: no → Nginx buffering disable (production mein important)
    //
    // CORS NOTE: Tumhara server.js mein cors({ origin: "*" }) already
    // sab routes pe lagta hai, isliye SSE ke liye alag CORS nahi chahiye.
    // Agar aage origin restrict kiya (e.g., sirf topbriefing.in allow karo),
    // toh SSE endpoint bhi automatically usi restriction mein aayega.
    // ─────────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx ke liye
    res.flushHeaders(); // Abhi headers bhej do, response band mat karo

    // ─── CLIENT REGISTER ─────────────────────────────────────
    // Har client ko unique ID dete hain (timestamp + random number)
    const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    connectedClients.set(clientId, res);
    console.log(`[SSE] Client connected: ${clientId}. Total clients: ${connectedClients.size}`);

    // ─── INITIAL HANDSHAKE MESSAGE ────────────────────────────
    // Client ko confirm karo ke connection successful hai
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE connection established', clientId })}\n\n`);

    // ─── HEARTBEAT ───────────────────────────────────────────
    // Problem: Agar 30-60 seconds tak koi data nahi aaya, toh
    // load balancers, proxies (Nginx, Vercel), aur browsers
    // connection timeout samajhke band kar dete hain.
    //
    // Solution: Har 30 second mein ek "comment" bhejte hain.
    // SSE mein colon (:) se shuru hone wali line comment hoti hai —
    // browser isse ignore karta hai lekin connection alive rehta hai.
    // ─────────────────────────────────────────────────────────
    const heartbeatInterval = setInterval(() => {
        try {
            res.write(':\n\n'); // SSE comment (heartbeat)
        } catch (err) {
            // Client gone
            clearInterval(heartbeatInterval);
        }
    }, 30000); // 30 seconds

    // ─── CLEANUP ON DISCONNECT ────────────────────────────────
    // Jab user tab close kare, browser close kare, ya network cut ho
    // toh 'close' event aata hai. Hum:
    //   1. Heartbeat timer band karte hain (memory leak prevent)
    //   2. Client ko Map se remove karte hain (memory leak prevent)
    //
    // Yeh bahut important hai production mein — bina cleanup ke
    // Map mein dead connections jama hote rahenge aur memory barh jaayegi.
    // ─────────────────────────────────────────────────────────
    req.on('close', () => {
        clearInterval(heartbeatInterval);
        connectedClients.delete(clientId);
        console.log(`[SSE] Client disconnected: ${clientId}. Total clients: ${connectedClients.size}`);
    });
});

module.exports = { router, initRedisSubscriber };
