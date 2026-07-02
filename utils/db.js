const mongoose = require('mongoose');

const db_connect = async () => {
    try {
        // NOTE: tlsAllowInvalidCertificates hack removed.
        // Node v20 LTS + WSL2 has full OpenSSL compatibility with
        // MongoDB Atlas — no special TLS options needed in any environment.

        if (process.env.MODE === 'production') {
            await mongoose.connect(process.env.DB_PRODUCTION_URL);
            console.log('production connect database');
        } else {
            await mongoose.connect(process.env.DB_LOCAL_URL);
            console.log('local connect database');
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = db_connect;