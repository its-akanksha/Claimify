import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window | undefined>('Window', {
  providedIn: 'root',
  factory: () => (typeof window !== 'undefined' ? window : undefined) // ✅ SSR-safe check
});
