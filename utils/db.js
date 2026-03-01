const mongoose = require("mongoose");

let isConnected = false;

const db_connect = async () => {
  if (isConnected) {
    return;
  }

  try {
    const DB_URI =
      process.env.NODE_ENV === "production"
        ? process.env.DB_PRODUCTION_URL
        : process.env.DB_LOCAL_URL;

    if (!DB_URI) {
      throw new Error("Database URI not found in environment variables");
    }

    const conn = await mongoose.connect(DB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = db_connect;


// const mongoose = require('mongoose');
// const db_connect = async () => {
//     try {
  
//         if(process.env.MODE === 'production'){
//              await mongoose.connect(process.env.DB_PRODUCTION_URL)
//              console.log(' production connect database')

//             }else{
//                 console.log('ok')
//                 await mongoose.connect(process.env.DB_LOCAL_URL)
//                 console.log('local connect database')
//             }
//     } catch (error) {
//         console.log(error)

//     }
// }

// module.exports = db_connect;