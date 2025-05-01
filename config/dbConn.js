const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            //useUnifiedTopology: true,     //MAY NO LONGER BE NEEDED. DEPRECATED OPTION. HAS NO EFFECT
            //useNewUrlParser: true         //MAY NO LONGER BE NEEDED. DEPRECATED OPTION. HAS NO EFFECT
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB;