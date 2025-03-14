const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,);
    console.log('CONNECTED TO DATABASE SUCCESSFULLY');
  } catch (err) {
    console.log('COULD NOT CONNECT TO DATABASE: ', err.message)
    process.exit(1);
  }
};

module.exports = connectDB;
