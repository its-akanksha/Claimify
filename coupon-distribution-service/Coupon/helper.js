
// async function checkLastClaim(ip) {
//     try {
//         const user = await Coupon.findOne({ assignedTo: ip }).sort({ claimedAt: -1 });
//         if (user) {
//             return user.claimedAt ? user.claimedAt.getTime() : null;
//         }
//         return null;
//     } catch (err) {
//         console.error('Error checking last claim:', err);
//         return null;
//     }
// }

// async function setLastClaim(ip, timestamp) {
//     try {
//         await Coupon.updateOne(
//             { assignedTo: ip },
//             {
//                 $set: {
//                     claimedAt: new Date(timestamp),
//                     status: 'claimed',
//                 }
//             },
//             { upsert: true }
//         );
//     } catch (err) {
//         console.error('Error setting last claim:', err);
//     }
// }

// async function getNextCouponIndex(total) {
//     try {
//         const lastCoupon = await Coupon.findOne().sort({ claimedAt: -1 });
//         if (lastCoupon) {
//             lastAssignedIndex = (lastAssignedIndex + 1) % total;
//             return lastAssignedIndex;
//         } else {
//             lastAssignedIndex = 0;
//             return lastAssignedIndex;
//         }
//     } catch (err) {
//         console.error('Error getting next coupon index:', err);
//         lastAssignedIndex = (lastAssignedIndex + 1) % total;
//         return lastAssignedIndex;
//     }
// }

// function calculateRemainingTime(lastClaimTime) {
//     const now = Date.now();
//     const elapsedTime = now - lastClaimTime;

//     if (elapsedTime < CLAIM_INTERVAL) {
//         return Math.ceil((CLAIM_INTERVAL - elapsedTime) / 60000);
//     }

//     return 0;
// }

// async function maintainCouponLimit() {
//     try {
//         const totalCoupons = await Coupon.countDocuments();
//         if (totalCoupons > MAX_COUPONS) {
//             await Coupon.findOneAndDelete().sort({ claimedAt: 1 });
//         }
//     } catch (err) {
//         console.error('Error maintaining coupon limit:', err);
//     }
// }

// module.exports = {
//     checkLastClaim,
//     setLastClaim,
//     getNextCouponIndex,
//     calculateRemainingTime,
//     maintainCouponLimit
// };

const Coupon = require('./model');

// const CLAIM_INTERVAL = 60 * 60 * 1000;
const MAX_COUPONS = 10;
// const Coupon = require('./model.js');

// const inMemoryIpMap = new Map(); 
let lastAssignedIndex = -1;

// const CLAIM_INTERVAL = 60 * 60 * 1000;
const CLAIM_INTERVAL = 30 * 1000;
const COOKIE_NAME = 'last_coupon_claim';


async function checkLastClaim(ip) {
    try {
        const user = await Coupon.findOne({ assignedTo: ip }).sort({ claimedAt: -1 });
        return user ? user.claimedAt?.getTime() || null : null;
    } catch (err) {
        console.error('Error checking last claim:', err);
        return null;
    }
}

async function setLastClaim(ip, timestamp) {
    try {
        await Coupon.updateOne(
            { assignedTo: ip },
            { $set: { claimedAt: new Date(timestamp), status: 'claimed' } },
            { upsert: true }
        );
    } catch (err) {
        console.error('Error setting last claim:', err);
    }
}

function calculateRemainingTime(lastClaimTime) {
    const now = Date.now();
    const elapsedTime = now - lastClaimTime;
    return elapsedTime < CLAIM_INTERVAL ? Math.ceil((CLAIM_INTERVAL - elapsedTime) / 60000) : 0;
}

async function maintainCouponLimit() {
    try {
        await Coupon.updateMany(
            { expiresAt: { $lt: new Date() }, status: { $ne: 'expired' } },
            { $set: { status: 'expired' } }
        );

        const totalCoupons = await Coupon.countDocuments();
        if (totalCoupons > MAX_COUPONS) {
            await Coupon.findOneAndDelete({ status: 'expired' }).sort({ claimedAt: 1 });
        }
    } catch (err) {
        console.error('Error maintaining coupon limit:', err);
    }
}

async function getNextCouponIndex(total) {
    try {
        const lastCoupon = await Coupon.findOne().sort({ claimedAt: -1 });
        if (lastCoupon) {
            lastAssignedIndex = (lastAssignedIndex + 1) % total;
            return lastAssignedIndex;
        } else {
            lastAssignedIndex = 0;
            return lastAssignedIndex;
        }
    } catch (err) {
        console.error('Error getting next coupon index:', err);
        lastAssignedIndex = (lastAssignedIndex + 1) % total;
        return lastAssignedIndex;
    }
}

module.exports = {
    checkLastClaim,
    setLastClaim,
    calculateRemainingTime,
    maintainCouponLimit,
    getNextCouponIndex
};

