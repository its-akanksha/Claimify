import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon } from '../components/coupon/coupon.model';

@Injectable({
  providedIn: 'root'
})

export class CouponService {
  private baseUrl = 'http://localhost:5000/api/coupons';

  constructor(private http: HttpClient) {}

  getCoupon(): Observable<any> {
    return this.http.get<Coupon>(`${this.baseUrl}/get-coupon`);
  }

  addCoupon(couponCode: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-coupon`, { couponCode });
  }

  getLatestCoupons() {
    return this.http.get<Coupon[]>(`${this.baseUrl}/latest-coupons`);
  }
  
}
