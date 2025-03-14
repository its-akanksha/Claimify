const Coupon = require('./model.js');

async function cleanupExpiredCoupons() {
  const now = new Date();
  await Coupon.deleteMany({ expiresAt: { $lt: now } });
  console.log('Expired coupons cleaned up.');
}

module.exports = cleanupExpiredCoupons;
