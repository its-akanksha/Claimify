const Coupon = require('./model');

const generateCouponCode = () => {
  // Generate a 6-digit alphanumeric code in uppercase
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateCoupons = async () => {
  try {
    // Count available coupons
    const availableCoupons = await Coupon.countDocuments({ status: 'available' });

    if (availableCoupons < 10) {
      const couponsToCreate = 10 - availableCoupons;

      for (let i = 0; i < couponsToCreate; i++) {
        let newCouponCode;
        let isDuplicate = true;

        // Ensure unique coupon code
        while (isDuplicate) {
          newCouponCode = generateCouponCode();
          const existingCoupon = await Coupon.findOne({ couponCode: newCouponCode });
          if (!existingCoupon) isDuplicate = false;
        }

        // Create new coupon
        await Coupon.create({
          couponCode: newCouponCode,
          status: 'available'
        });

        console.log(`Generated coupon: ${newCouponCode}`);
      }
    }
  } catch (error) {
    console.error('Error generating coupons:', error);
  }
};

module.exports = generateCoupons;
