-- =========================================================================
-- TAILORHUB COMPLETE PRODUCTION-GRADE POSTGRESQL / SUPABASE SCHEMA (v2.0)
-- Compatible with PostgreSQL 14+, AWS RDS, Supabase, and Neon PostgreSQL
-- =========================================================================

-- Enable UUID extension if desired
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core identity with role-based access control & demo mode flag)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role VARCHAR(20) CHECK(role IN ('CUSTOMER', 'TAILOR', 'ADMIN')) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  profile_image TEXT,
  location TEXT,
  password_hash TEXT NOT NULL,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tailor Profiles Table
CREATE TABLE IF NOT EXISTS tailor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  working_hours TEXT DEFAULT '9:00 AM - 8:00 PM',
  rating DOUBLE PRECISION DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  starting_price DOUBLE PRECISION DEFAULT 350.0,
  shop_images TEXT DEFAULT '[]',
  categories TEXT DEFAULT '[]',
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services Offered by Tailors
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  duration_days INTEGER DEFAULT 3,
  category TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tailor-Customer CRM Relationship
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  notes TEXT,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Digital Measurement Profiles
CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  garment_category TEXT NOT NULL,
  measurement_data TEXT NOT NULL,
  source VARCHAR(30) DEFAULT 'MANUAL',
  version INTEGER DEFAULT 1,
  is_default INTEGER DEFAULT 0,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Measurement Audit History (Immutable revision log)
CREATE TABLE IF NOT EXISTS measurement_history (
  id TEXT PRIMARY KEY,
  measurement_id TEXT NOT NULL REFERENCES measurements(id) ON DELETE CASCADE,
  measurement_data TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Stitching Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES users(id),
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id),
  garment_type TEXT NOT NULL,
  measurement_id TEXT NOT NULL REFERENCES measurements(id),
  status VARCHAR(30) NOT NULL,
  fabric_option VARCHAR(30) DEFAULT 'CUSTOMER_PROVIDED',
  total_amount DOUBLE PRECISION NOT NULL,
  advance_amount DOUBLE PRECISION NOT NULL,
  balance_amount DOUBLE PRECISION NOT NULL,
  delivery_date TEXT NOT NULL,
  instructions TEXT,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Status History Timeline
CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  changed_by TEXT NOT NULL,
  changed_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Order Items Breakdown
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  price DOUBLE PRECISION NOT NULL
);

-- 10. Customer Design Uploads
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Fitting & Consultation Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES services(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  appointment_type VARCHAR(20) DEFAULT 'FITTING',
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Payments Ledger
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id),
  amount DOUBLE PRECISION NOT NULL,
  transaction_id TEXT NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Customer-Tailor Direct Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id),
  receiver_id TEXT NOT NULL REFERENCES users(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  message TEXT NOT NULL,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- 15. User Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  is_read INTEGER DEFAULT 0,
  is_demo INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. TailorHub Lens Scanned Records
CREATE TABLE IF NOT EXISTS scanned_records (
  id TEXT PRIMARY KEY,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  original_image_url TEXT NOT NULL,
  enhanced_image_url TEXT,
  raw_ocr_text TEXT,
  extracted_data TEXT NOT NULL,
  confidence_data TEXT NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'PENDING',
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Historical Orders (Digitized from Old Register Books)
CREATE TABLE IF NOT EXISTS historical_orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tailor_id TEXT NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  garment_type TEXT NOT NULL,
  order_date TEXT,
  delivery_date TEXT,
  quantity INTEGER DEFAULT 1,
  price DOUBLE PRECISION,
  advance DOUBLE PRECISION,
  balance DOUBLE PRECISION,
  notes TEXT,
  source VARCHAR(30) DEFAULT 'SCANNED_RECORD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. AI Style Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  input_data TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Security & Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- HIGH-PERFORMANCE PRODUCTION INDEXES
-- =========================================================================

-- Mode Isolation Indexes (Sub-millisecond LIVE vs DEMO queries)
CREATE INDEX IF NOT EXISTS idx_users_demo ON users(is_demo);
CREATE INDEX IF NOT EXISTS idx_tailor_profiles_demo ON tailor_profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_services_demo ON services(is_demo);
CREATE INDEX IF NOT EXISTS idx_customers_demo ON customers(is_demo);
CREATE INDEX IF NOT EXISTS idx_measurements_demo ON measurements(is_demo);
CREATE INDEX IF NOT EXISTS idx_orders_demo ON orders(is_demo);
CREATE INDEX IF NOT EXISTS idx_appointments_demo ON appointments(is_demo);
CREATE INDEX IF NOT EXISTS idx_payments_demo ON payments(is_demo);
CREATE INDEX IF NOT EXISTS idx_reviews_demo ON reviews(is_demo);
CREATE INDEX IF NOT EXISTS idx_messages_demo ON messages(is_demo);
CREATE INDEX IF NOT EXISTS idx_notifications_demo ON notifications(is_demo);

-- Foreign Key & Lookups Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_tailor_profiles_user_id ON tailor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_services_tailor_id ON services(tailor_id);
CREATE INDEX IF NOT EXISTS idx_customers_tailor_id ON customers(tailor_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_customer_id ON measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_tailor_id ON orders(tailor_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tailor_id ON appointments(tailor_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_scanned_records_tailor_id ON scanned_records(tailor_id);
