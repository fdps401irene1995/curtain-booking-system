export type ViewMode = 'admin' | 'customer';

export type BookingStatus = '待確認' | '已確認' | '已完成' | '已取消';
export type BookingSource = '客戶線上預約' | '公司安排' | '阿倫自約';
export type DealStatus = '洽談中' | '已成交' | '未成交';

export interface TimeSlot {
  time: string;
  isBooked: boolean;
}

export interface Availability {
  [date: string]: TimeSlot[];
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  windowCount: string;
  curtainStyle: string;
  referencePhoto?: string;
  status: BookingStatus;
  source: BookingSource;
  dealStatus: DealStatus;
  notes: Note[];
}

export interface CustomRequest {
  id:string;
  requestedDate: string;
  requestedTime: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  windowCount: string;
  curtainStyle: string;
  referencePhoto?: string;
  status: BookingStatus;
  dealStatus: DealStatus;
  notes: Note[];
}

export type UserRole = 'superadmin' | 'admin';

export interface User {
  id: string;
  username: string;
  password?: string; // Password is handled by Firebase Auth, not stored in Firestore doc
  role: UserRole;
  email?: string;
  phone?: string;
}