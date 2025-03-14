const express = require('express');
const router = express.Router();
const Coupon = require('./model');
const {
    checkLastClaim,
    setLastClaim,
    getNextCouponIndex,
    calculateRemainingTime,
    maintainCouponLimit
} = require('./helper.js');
const inMemoryIpMap = new Map(); 
let lastAssignedIndex = -1;

const CLAIM_INTERVAL = 60 * 60 * 1000;
// const CLAIM_INTERVAL =  1000;
const COOKIE_NAME = 'last_coupon_claim';
const MAX_COUPONS = 10;

router.get('/get-coupon', async (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    try {
        const cookieLastClaim = req.cookies?.[COOKIE_NAME] ? parseInt(req.cookies[COOKIE_NAME]) : null;
        if (cookieLastClaim) {
            const remainingTime = calculateRemainingTime(cookieLastClaim);
            if (remainingTime > 0) {
                return res.status(429).json({
                    message: `Please wait before claiming another coupon.`
                });
            }
        }

        const ipLastClaim = await checkLastClaim(ip);
        if (ipLastClaim) {
            const remainingTime = calculateRemainingTime(ipLastClaim);
            if (remainingTime > 0) {
                return res.status(429).json({
                    message: `Please wait ${remainingTime} minutes before claiming another coupon.`
                });
            }
        }

        const coupons = await Coupon.find({ status: 'available' }).sort('_id');
        if (coupons.length === 0) {
            return res.status(400).json({ message: 'No coupons available.' });
        }

        const nextIndex = await getNextCouponIndex(coupons.length);
        const assignedCoupon = coupons[nextIndex];

        const updatedCoupon = await Coupon.findOneAndUpdate(
            { _id: assignedCoupon._id, status: 'available' },
            {
                status: 'claimed',
                assignedTo: ip,
                claimedAt: new Date(),
                expiresAt: new Date(now + CLAIM_INTERVAL)
            },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.redirect(307, '/api/coupons/get-coupon');
        }

        await maintainCouponLimit();

        res.cookie(COOKIE_NAME, now.toString(), {
            maxAge: CLAIM_INTERVAL,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        await setLastClaim(ip, now);

        return res.json({
            couponCode: updatedCoupon.couponCode,
            expiresAt: updatedCoupon.expiresAt.toISOString()
        });
    } catch (err) {
        console.error('Error claiming coupon:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

router.post('/add-coupon', async (req, res) => {
    try {
        if (!req.body.couponCode) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const existingCoupon = await Coupon.findOne({ couponCode: req.body.couponCode });
        if (existingCoupon) {
            return res.status(409).json({ message: 'Coupon code already exists' });
        }

        const newCoupon = new Coupon({
            ...req.body,
            status: req.body.status || 'available'
        });

        await newCoupon.save();

        res.status(201).json(newCoupon);
    } catch (err) {
        console.error('Error adding coupon:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

router.get('/reset-claim', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Claim cookie cleared successfully' });
});

router.get('/health', async (req, res) => {
    const status = {
        database: 'connected',
        redis: redisAvailable ? 'connected' : 'disconnected',
        storage_mode: redisAvailable ? 'redis' : 'in-memory'
    };

    res.status(200).json(status);
});

router.get('/latest-coupons', async (req, res) => {
    try {
        const latestCoupons = await Coupon.find({ status: 'available' })
            .sort({ createdAt: -1 }) 
            .limit(10);
        res.json(latestCoupons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load latest coupons' });
    }
});


module.exports = router;