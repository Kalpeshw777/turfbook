export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export type SportType =
  | 'FOOTBALL'
  | 'CRICKET'
  | 'BOX_CRICKET'
  | 'BADMINTON'
  | 'PICKLEBALL'
  | 'TENNIS';

export type SlotStatusType = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'MAINTENANCE';

export type BookingStatusType =
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED';

export type PaymentStatusType =
  | 'PAID'
  | 'ADVANCE_PAID'
  | 'PENDING_AT_VENUE'
  | 'REFUNDED';

export interface GroundDetail {
  id: string;
  turfId: string;
  name: string;
  sport: SportType | string;
  surfaceType: string;
  size: string;
  indoorOutdoor: string;
  basePrice: number;
}

export interface TurfDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  area: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
  amenities: string[];
  isApproved: boolean;
  openTime: string;
  closeTime: string;
  grounds: GroundDetail[];
  reviewsCount?: number;
  averageRating?: number;
}

export interface SlotItem {
  id?: string;
  groundId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatusType;
  bookingId?: string | null;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  icon?: string | null;
  description?: string | null;
  isAvailable: boolean;
}

export interface CouponItem {
  id: string;
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minAmount: number;
  maxDiscount?: number | null;
  validUntil: string;
  isActive: boolean;
}
