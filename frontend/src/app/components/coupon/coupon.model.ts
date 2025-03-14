export interface Coupon {
    couponCode: string;
    status: 'available' | 'claimed';
    assignedTo?: string;
    claimedAt?: Date;
    expiresAt?: Date;
}
