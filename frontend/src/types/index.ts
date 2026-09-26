export type UserRole = 'CUSTOMER' | 'TAILOR' | 'STAFF' | 'SHOP_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export type StaffRole =
  | 'MASTER_TAILOR'
  | 'CUTTER'
  | 'STITCHER'
  | 'FINISHER'
  | 'QUALITY_CONTROLLER'
  | 'SALES'
  | 'SHOP_MANAGER';

export interface StaffMember {
  id: string;
  tailor_id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
  is_active: boolean;
  assigned_orders_count?: number;
  created_at: string;
  updated_at?: string;
}

export type LanguageCode = 'en' | 'te' | 'hi';

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'ORDER_ACCEPTED'
  | 'MEASUREMENT_CONFIRMED'
  | 'FABRIC_RECEIVED'
  | 'CUTTING'
  | 'STITCHING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: LanguageCode;
  profile_image?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
}

export interface TailorProfile {
  id: string;
  user_id: string;
  shop_name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  working_hours: string;
  rating: number;
  review_count: number;
  starting_price: number;
  shop_images: string[];
  categories: string[];
  user?: User;
  created_at: string;
  updated_at?: string;
}

export interface ServiceItem {
  id: string;
  tailor_id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  user_id: string;
  tailor_id: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface UpperBodyMeasurements {
  chest?: number;
  shoulder?: number;
  neck?: number;
  sleeve?: number;
  armhole?: number;
  shirt_length?: number;
  bicep?: number;
  wrist?: number;
}

export interface LowerBodyMeasurements {
  waist?: number;
  hip?: number;
  thigh?: number;
  knee?: number;
  bottom?: number;
  pant_length?: number;
  rise?: number;
}

export interface CustomMeasurement {
  name: string;
  value: number;
  unit: 'inches' | 'cm';
}

export interface MeasurementData {
  upper_body: UpperBodyMeasurements;
  lower_body: LowerBodyMeasurements;
  custom_measurements?: CustomMeasurement[];
}

export interface MeasurementProfile {
  id: string;
  customer_id: string;
  profile_name: string;
  garment_category: string;
  measurement_data: MeasurementData;
  source?: MeasurementSource;
  version: number;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MeasurementHistory {
  id: string;
  measurement_id: string;
  measurement_data: MeasurementData;
  changed_by: string;
  version: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderDesign {
  id: string;
  order_id: string;
  image_url: string;
  notes?: string;
  created_at: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface StitchingOrder {
  id: string;
  order_number: string;
  customer_id: string;
  tailor_id: string;
  garment_type: string;
  measurement_id: string;
  status: OrderStatus;
  fabric_option: 'CUSTOMER_PROVIDED' | 'TAILOR_PROVIDED';
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  delivery_date: string;
  instructions?: string;
  customer?: User;
  tailor_profile?: TailorProfile;
  measurement_profile?: MeasurementProfile;
  designs?: OrderDesign[];
  status_history?: OrderStatusHistoryItem[];
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  tailor_id: string;
  service_id: string;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  appointment_type: 'FITTING' | 'MEASUREMENT' | 'CONSULTATION' | 'PICKUP';
  status: AppointmentStatus;
  notes?: string;
  customer?: User;
  tailor_profile?: TailorProfile;
  created_at: string;
  updated_at?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  customer_id: string;
  tailor_id: string;
  amount: number;
  transaction_id: string;
  payment_method: 'RAZORPAY' | 'UPI' | 'CARD' | 'CASH';
  status: PaymentStatus;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'ORDER_STATUS' | 'APPOINTMENT' | 'PAYMENT' | 'CHAT' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  order_id: string;
  message: string;
  created_at: string;
  read_at?: string;
  sender_name?: string;
}

export type MeasurementSource = 'MANUAL' | 'SCANNED_RECORD' | 'CUSTOMER_ENTERED' | 'TAILOR_UPDATED';

export interface OCRFieldConfidence {
  field: string;
  value: string;
  confidence: number;
  source?: string;
  is_uncertain?: boolean;
}

export interface ExtractedCustomerCandidate {
  candidate_id: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  address?: string;
  garment_type: string;
  quantity?: number;
  order_date?: string;
  delivery_date?: string;
  price?: number;
  advance?: number;
  balance?: number;
  stitching_instructions?: string;
  notes?: string;
  upper_body: UpperBodyMeasurements;
  lower_body: LowerBodyMeasurements;
  confidence: Record<string, OCRFieldConfidence>;
  overall_confidence: number;
}

export interface ScannedRecord {
  id: string;
  tailor_id: string;
  customer_id?: string;
  original_image_url: string;
  enhanced_image_url?: string;
  raw_ocr_text: string;
  extracted_data: ExtractedCustomerCandidate[] | Record<string, any>;
  confidence_data: Record<string, any>;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface HistoricalOrder {
  id: string;
  customer_id: string;
  tailor_id: string;
  garment_type: string;
  order_date?: string;
  delivery_date?: string;
  quantity: number;
  price: number;
  advance: number;
  balance: number;
  notes?: string;
  source: 'SCANNED_RECORD' | 'MANUAL_IMPORT';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: string;
  created_at: string;
}

export interface DuplicateMatchInfo {
  is_duplicate: boolean;
  match_type?: 'EXACT_PHONE' | 'NAME_AND_PARTIAL_PHONE' | 'NAME_SIMILARITY';
  existing_customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    total_orders: number;
    last_measurement_date?: string;
  };
}

export interface OldRecord {
  id: string;
  tailor_id: string;
  image_url: string;
  extracted_data: Record<string, string>;
  confidence_data: Record<string, OCRFieldConfidence>;
  verified_data?: Record<string, string>;
  verification_status: 'PENDING' | 'VERIFIED' | 'DISCARDED';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface AIStyleInput {
  garment: string;
  occasion: string;
  color_preference?: string;
  sleeve_preference?: string;
  neck_preference?: string;
  fit_preference?: string;
  notes?: string;
}

export interface AIStyleRecommendation {
  id: string;
  customer_id: string;
  order_id?: string;
  input_data: AIStyleInput;
  recommendation: {
    title: string;
    neck_design: string;
    sleeve_design: string;
    pattern_suggestion: string;
    color_combination: string;
    occasion_suitability: string;
    styling_tips: string[];
  };
  created_at: string;
}

export interface TailorAnalyticsMetrics {
  daily_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  pending_payments: number;
  repeat_customers: number;
  revenue_by_day: Array<{ date: string; revenue: number }>;
  orders_by_status: Array<{ status: OrderStatus; count: number }>;
  popular_services: Array<{ service_name: string; count: number; revenue: number }>;
}

export interface AdminAnalyticsMetrics {
  total_users: number;
  total_tailors: number;
  total_customers: number;
  total_orders: number;
  total_platform_revenue: number;
  active_users_today: number;
  total_complaints: number;
}
