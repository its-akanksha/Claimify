// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const cookieParser = require('cookie-parser');
// // const cleanupExpiredCoupons = require('./Coupon/cleanup.js');
// const cron = require('node-cron');
// const generateCoupons = require('./Coupon/generateCoupon.js');

// dotenv.config();
// connectDB();

// const app = express();

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors());

// app.use('/api/coupons', require('./Coupon/route.js'));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// setInterval(async () => {
//   try {
//     await cleanupExpiredCoupons();
//   } catch (error) {
//     console.error('Error during cleanup task:', error);
//   }
// }, 24 * 60 * 60 * 1000);

// cron.schedule('* * * * *', async () => {
//   console.log('Running coupon generation cron job...');
//   try {
//     await generateCoupons();
//     console.log('Coupon generation job completed successfully.');
//   } catch (error) {
//     console.error('Error generating coupons:', error);
//   }
// }, {
//   scheduled: true,
//   timezone: 'UTC'
// });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const generateCoupons = require('./Coupon/generateCoupon.js');
const { maintainCouponLimit } = require('./Coupon/helper.js');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/api/coupons', require('./Coupon/route.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

cron.schedule('* * * * *', async () => {
    console.log('Running coupon generation cron job...');
    try {
        await maintainCouponLimit();
        await generateCoupons();
        console.log('Coupon generation job completed successfully.');
    } catch (error) {
        console.error('Error in coupon generation job:', error);
    }
}, {
    scheduled: true,
    timezone: 'UTC'
});
