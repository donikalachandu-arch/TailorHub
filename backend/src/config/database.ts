import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace('file:', '')
    : path.join(__dirname, '../../tailorhub.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  await initSchema(dbInstance);

  return dbInstance;
}

async function initSchema(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      role TEXT CHECK(role IN ('CUSTOMER', 'TAILOR', 'ADMIN')) NOT NULL,
      language TEXT DEFAULT 'en',
      profile_image TEXT,
      location TEXT,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tailor_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      shop_name TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      working_hours TEXT DEFAULT '9:00 AM - 8:00 PM',
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      starting_price REAL DEFAULT 350.0,
      shop_images TEXT DEFAULT '[]',
      categories TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      tailor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_days INTEGER DEFAULT 3,
      category TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      profile_name TEXT NOT NULL,
      garment_category TEXT NOT NULL,
      measurement_data TEXT NOT NULL,
      source TEXT DEFAULT 'MANUAL',
      version INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS measurement_history (
      id TEXT PRIMARY KEY,
      measurement_id TEXT NOT NULL,
      measurement_data TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      version INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      garment_type TEXT NOT NULL,
      measurement_id TEXT NOT NULL,
      status TEXT NOT NULL,
      fabric_option TEXT DEFAULT 'CUSTOMER_PROVIDED',
      total_amount REAL NOT NULL,
      advance_amount REAL NOT NULL,
      balance_amount REAL NOT NULL,
      delivery_date TEXT NOT NULL,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id),
      FOREIGN KEY (measurement_id) REFERENCES measurements(id)
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      changed_by_name TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS designs (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      appointment_type TEXT DEFAULT 'FITTING',
      status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      amount REAL NOT NULL,
      transaction_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS old_records (
      id TEXT PRIMARY KEY,
      tailor_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      extracted_data TEXT NOT NULL,
      confidence_data TEXT NOT NULL,
      verified_data TEXT,
      verification_status TEXT DEFAULT 'PENDING',
      verified_by TEXT,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS scanned_records (
      id TEXT PRIMARY KEY,
      tailor_id TEXT NOT NULL,
      customer_id TEXT,
      original_image_url TEXT NOT NULL,
      enhanced_image_url TEXT,
      raw_ocr_text TEXT,
      extracted_data TEXT NOT NULL,
      confidence_data TEXT NOT NULL,
      verification_status TEXT DEFAULT 'PENDING',
      verified_by TEXT,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS historical_orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      garment_type TEXT NOT NULL,
      order_date TEXT,
      delivery_date TEXT,
      quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      advance REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      notes TEXT,
      source TEXT DEFAULT 'SCANNED_RECORD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_id TEXT,
      input_data TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      rating REAL NOT NULL,
      review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      tailor_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS shop_holidays (
      id TEXT PRIMARY KEY,
      tailor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      reason TEXT,
      FOREIGN KEY (tailor_id) REFERENCES tailor_profiles(id)
    );

    -- Indices for high performance queries
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_tailor ON orders(tailor_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_tailor ON appointments(tailor_id, date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
    CREATE INDEX IF NOT EXISTS idx_scanned_tailor ON scanned_records(tailor_id);
    CREATE INDEX IF NOT EXISTS idx_hist_orders_cust ON historical_orders(customer_id);
  `);

  // Safe migration for source column in measurements
  try {
    const measCols = await db.all("PRAGMA table_info(measurements)");
    const hasSource = measCols.some((c: any) => c.name === 'source');
    if (!hasSource) {
      await db.exec("ALTER TABLE measurements ADD COLUMN source TEXT DEFAULT 'MANUAL'");
    }
  } catch (e) {
    // Column already exists or error handled
  }
}
