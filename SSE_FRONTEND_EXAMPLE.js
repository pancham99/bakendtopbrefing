// ─────────────────────────────────────────────────────────────
//  SSE_FRONTEND_EXAMPLE.js
//  Frontend mein EventSource use karna — React example
//
//  NOTE: Yeh file sirf reference ke liye hai.
//  Isko apne Next.js/React component mein copy karo.
// ─────────────────────────────────────────────────────────────


// ════════════════════════════════════════════════════════════
//  VANILLA JAVASCRIPT EXAMPLE (framework ke bina)
// ════════════════════════════════════════════════════════════

/*

// ─── EventSource kya hai? ────────────────────────────────────
// EventSource browser ka built-in API hai SSE ke liye.
// WebSocket se alag — yeh sirf SERVER → CLIENT direction mein kaam karta hai.
// News updates ke liye yeh perfect hai.
//
// Browser support: Sabhi modern browsers (Chrome, Firefox, Safari, Edge)
// IE support nahi hai — lekin 2024 mein koi IE use nahi karta.
// ─────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:5000'; // apna backend URL lagao

// Step 1: Connection banao
const eventSource = new EventSource(`${API_URL}/api/news/stream`);

// Step 2: "news:active" event sun — DEFAULT "onmessage" NAHI
//
// WHY addEventListener? WHY NOT onmessage?
//
// Humne server pe likha hai:  event: news:active
// Yeh ek CUSTOM event type hai.
// eventSource.onmessage sirf DEFAULT events (bina event: field ke) ke liye kaam karta hai.
// Custom event sunne ke liye addEventListener use karna zaroori hai.
//
// Galat tarika (kaam nahi karega):
//   eventSource.onmessage = (e) => { ... }  ❌
//
// Sahi tarika:
//   eventSource.addEventListener('news:active', (e) => { ... })  ✅

eventSource.addEventListener('news:active', (event) => {
    const newNews = JSON.parse(event.data); // JSON parse karo
    console.log('New news received:', newNews);
    
    // Yahan apna UI update logic likhna
    // Jaise: newsArray mein push karo, state update karo
});

// Step 3: Connection confirm hone par (optional)
eventSource.addEventListener('connected', (event) => {
    const data = JSON.parse(event.data);
    console.log('SSE Connected! Client ID:', data.clientId);
});

// Step 4: Error handle karo
eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    
    // ─── AUTO-RECONNECT ──────────────────────────────────────
    // EventSource ka SUPERPOWER: browser automatically reconnect karta hai
    // agar connection toot jaaye!
    //
    // Browser ki retry behavior:
    //   1. Connection toot gayi
    //   2. Browser ~3 seconds wait karta hai
    //   3. Phir dobara connect karne ki koshish karta hai
    //   4. Yeh automatically hota hai — tumhe kuch nahi karna
    //
    // Yeh WebSocket se better hai jahan tumhe khud reconnect logic likhna padta.
    // ─────────────────────────────────────────────────────────
    
    if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection permanently closed');
    }
};

// Step 5: Jab page close ho, connection band karo (optional lekin good practice)
window.addEventListener('beforeunload', () => {
    eventSource.close();
});

*/


// ════════════════════════════════════════════════════════════
//  REACT / NEXT.JS COMPONENT EXAMPLE
// ════════════════════════════════════════════════════════════

/*

'use client'; // Next.js App Router ke liye

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LatestNews = () => {
    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        // ─── SSE CONNECTION ──────────────────────────────────
        // useEffect mein banate hain taaki component mount hone par
        // connection bane aur unmount hone par close ho.
        const eventSource = new EventSource(`${API_URL}/api/news/stream`);

        // Custom "news:active" event listen karo
        eventSource.addEventListener('news:active', (event) => {
            try {
                const newNews = JSON.parse(event.data);

                // ─── STATE UPDATE ─────────────────────────────
                // New news ko list ke TOP mein add karo
                // (spread operator: naya item pehle, phir baaki sab)
                setNewsList((prevList) => [newNews, ...prevList]);

                // Optional: user ko notification dikhao
                console.log('🔴 LIVE: New news published:', newNews.title);
            } catch (err) {
                console.error('Failed to parse SSE data:', err);
            }
        });

        // Error handling
        eventSource.onerror = (error) => {
            // EventSource auto-reconnect karega — hum sirf log karte hain
            console.warn('SSE connection error, browser will auto-reconnect...', error);
        };

        // ─── CLEANUP ─────────────────────────────────────────
        // Component unmount hone par connection band karo.
        // Bina cleanup ke: component hat gaya lekin connection chalta rahega
        // → memory leak!
        return () => {
            console.log('Closing SSE connection...');
            eventSource.close();
        };
    }, []); // [] = sirf ek baar run karo (component mount par)

    return (
        <div>
            <h2>Latest News (Live)</h2>
            {newsList.map((news) => (
                <div key={news._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <img src={news.image} alt={news.title} width={100} />
                    <h3>{news.title}</h3>
                    <p>Category: {news.category}</p>
                    <p>Writer: {news.writerName}</p>
                    <a href={`/news/${news.slug}`}>Read More</a>
                </div>
            ))}
        </div>
    );
};

export default LatestNews;

*/


// ════════════════════════════════════════════════════════════
//  FLOW SUMMARY (POORA SYSTEM SAMJHO)
// ════════════════════════════════════════════════════════════

/*

1. Writer news likhta hai → status: "pending" (MongoDB mein save)

2. Admin dashboard pe approve karta hai:
   PUT /api/news/status-update/:news_id  { status: "active" }

3. newsController.update_news_status runs:
   a. MongoDB mein status "active" ho jaata hai
   b. publishClient.publish('news:active', newsJSON) → Redis ko message jaata hai
   c. Admin ko 200 response milta hai (Redis ka wait nahi kiya)

4. Redis "news:active" channel pe message aata hai

5. subscribeClient (server.js mein initialized) woh message receive karta hai

6. sseRouters.js ka 'message' event handler chalta hai:
   - connectedClients Map loop hota hai
   - Har ek open SSE connection pe data bheja jaata hai

7. Browser mein EventSource ka 'news:active' event fire hota hai

8. React state update → UI mein instantly naya news dikh jaata hai

Total delay: typically 50-200ms (MongoDB + Redis + network)

*/
