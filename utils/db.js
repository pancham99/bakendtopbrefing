const mongoose = require('mongoose');
const db_connect = async () => {
    try {
  
        if(process.env.MODE === 'production'){
             await mongoose.connect(process.env.DB_PRODUCTION_URL)
             console.log(' production connect database')

            }else{
                console.log('ok')
                await mongoose.connect(process.env.DB_LOCAL_URL)
                console.log('local connect database')
            }
    } catch (error) {
        console.log(error)

    }
}

module.exports = db_connect;