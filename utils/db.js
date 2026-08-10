const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare DNS to bypass local ISP DNS blocking MongoDB SRV records
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
    console.warn('Unable to set custom DNS servers:', e.message);
}

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const db_connect = async () => {
    try {
        const url = process.env.MODE === 'production' ? process.env.DB_PRODUCTION_URL : process.env.DB_LOCAL_URL;
        if (!url) {
            console.error('❌ Database URL is not defined in environment variables');
            return;
        }

        await mongoose.connect(url);
        console.log(`✅ ${process.env.MODE === 'production' ? 'Production' : 'Local'} database connected successfully`);
    } catch (error) {
        console.error('❌ Database connection error:', error.message || error);
    }
}

module.exports = db_connect;


