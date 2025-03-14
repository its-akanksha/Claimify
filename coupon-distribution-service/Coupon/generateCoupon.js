// const Coupon = require('./model');

// const generateCouponCode = () => {
//     return Math.random().toString(36).substring(2, 8).toUpperCase();
// };

// const generateCoupons = async () => {
//     try {
//         const availableCoupons = await Coupon.countDocuments({ status: 'available' });

//         if (availableCoupons < 10) {
//             const couponsToCreate = 10 - availableCoupons;

//             for (let i = 0; i < couponsToCreate; i++) {
//                 let newCouponCode;
//                 let isDuplicate = true;

//                 while (isDuplicate) {
//                     newCouponCode = generateCouponCode();
//                     const existingCoupon = await Coupon.findOne({ couponCode: newCouponCode });
//                     if (!existingCoupon) isDuplicate = false;
//                 }

//                 await Coupon.create({
//                     couponCode: newCouponCode,
//                     status: 'available'
//                 }).then((doc) => console.log('Coupon created:', doc))
//                     .catch((err) => console.error('Error:', err));

//                 console.log(`Generated coupon: ${newCouponCode}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error generating coupons:', error);
//     }
// };

// module.exports = generateCoupons;

const Coupon = require('./model');

const generateCouponCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const generateCoupons = async () => {
    try {
        const availableCoupons = await Coupon.countDocuments({ status: 'available' });

        if (availableCoupons < 10) {
            const couponsToCreate = 10 - availableCoupons;
            const newCoupons = [];

            for (let i = 0; i < couponsToCreate; i++) {
                let newCouponCode;
                let isDuplicate = true;

                while (isDuplicate) {
                    newCouponCode = generateCouponCode();
                    isDuplicate = await Coupon.exists({ couponCode: newCouponCode });
                }

                newCoupons.push({
                    couponCode: newCouponCode,
                    status: 'available'
                });
            }

            if (newCoupons.length) {
                await Coupon.insertMany(newCoupons);
                console.log(`Generated ${newCoupons.length} new coupons`);
            }
        }
    } catch (error) {
        console.error('Error generating coupons:', error);
    }
};

module.exports = generateCoupons;
