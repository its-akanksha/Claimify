import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { CouponService } from '../../services/coupon.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WINDOW } from '../../services/window.service';
import { Coupon } from './coupon.model';
import { ConfettiService } from '../../services/confetti.service';
@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class CouponComponent implements OnInit, OnDestroy {

  message: string = '';
  isSuccess: boolean | null = null;
  countdown: number = 0;
  countdownInterval: any;
  expiresAt: Date | null = null;
  couponCode: string | null = null;
  latestCoupons: Coupon[] = [];

  constructor(
    @Inject(WINDOW) private window: Window | undefined,
    private couponService: CouponService,
    private confettiService: ConfettiService
  ) {}

  ngOnInit() {
    this.retrieveStoredCoupon();
    this.checkExistingCooldown();
    this.loadLatestCoupons();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  private retrieveStoredCoupon() {
    if (this.window?.localStorage) {
      this.couponCode = this.window.localStorage.getItem('couponCode');
      console.log('Retrieved coupon from localStorage:', this.couponCode);
    }
  }

  private checkExistingCooldown() {
    if (this.window?.localStorage) {
      const storedExpiry = this.window.localStorage.getItem('couponExpiresAt');
      if (storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        const now = new Date();

        if (expiryDate > now) {
          const remainingTime = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
          if (remainingTime > 0) {
            this.message = 'Please wait before claiming another coupon.';
            this.isSuccess = false;
            this.startCountdown(remainingTime);
          } else {
            this.clearStoredCoupon();
          }
        } else {
          this.clearStoredCoupon();
        }
      }
    }
  }

  claimCoupon() {
    console.log("Button Clicked");
    if (this.countdown > 0) {
      return;
    }

    this.couponService.getCoupon().subscribe({
      next: (response) => {
        this.couponCode = response.couponCode;
        this.message = `Coupon Claimed: ${response.couponCode}`;
        this.isSuccess = true;

        this.window?.localStorage?.setItem('couponCode', response.couponCode);
        if (response.expiresAt) {
          const expiryDate = new Date(response.expiresAt);
          this.window?.localStorage?.setItem('couponExpiresAt', expiryDate.toISOString());
          this.setCooldown(expiryDate);
        }
        this.confettiService.triggerConfetti();
        this.loadLatestCoupons();
      },
      error: (error) => {
        this.message = error.error.message || 'Failed to claim coupon.';
        this.isSuccess = false;

        const match = this.message.match(/(\d+) minutes/);
        if (match) {
          const minutes = parseInt(match[1]);
          const expiryDate = new Date();
          expiryDate.setMinutes(expiryDate.getMinutes() + minutes);

          this.expiresAt = expiryDate;
          this.window?.localStorage?.setItem('couponExpiresAt', expiryDate.toISOString());
          this.startCountdown(minutes * 60);
        }
      }
    });
  }

  private setCooldown(expiryDate: Date) {
    this.expiresAt = expiryDate;
    const cooldownTime = Math.floor((expiryDate.getTime() - new Date().getTime()) / 1000);

    if (cooldownTime > 0) {
      this.startCountdown(cooldownTime);
    }
  }

  private startCountdown(seconds: number) {
    this.countdown = seconds;
    this.clearCountdown();

    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.message = `Please wait before claiming another coupon.`;
      } else {
        this.clearCountdown();
        this.message = 'You can claim a new coupon now.';
        this.clearStoredCoupon();
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private clearStoredCoupon() {
    this.window?.localStorage?.removeItem('couponExpiresAt');
    this.window?.localStorage?.removeItem('couponCode');
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  private loadLatestCoupons() {
    this.couponService.getLatestCoupons().subscribe({
      next: (response) => {
        this.latestCoupons = response;
      },
      error: (error) => {
        console.error('Failed to load latest coupons:', error);
      }
    });
  }
}
