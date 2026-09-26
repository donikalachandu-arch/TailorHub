import { getDatabase } from './database';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDatabase();
  console.log('Seeding TailorHub database with authentic startup data & isolated demo dataset...');

  await db.exec('PRAGMA foreign_keys = OFF;');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // =========================================================================
  // 1. PRODUCTION DATA (is_demo = 0)
  // =========================================================================

  // Production Users
  const prodUsers = [
    { id: 'usr-admin-1', name: 'Platform Admin', email: 'admin@tailorhub.com', phone: '9000000000', role: 'ADMIN', language: 'en', pass: adminHash, is_demo: 0 },
    
    // Tailors
    { id: 'usr-tailor-1', name: 'Ramesh Kumar', email: 'ramesh@tailors.com', phone: '9876543210', role: 'TAILOR', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', loc: 'Banjara Hills, Hyderabad', is_demo: 0 },
    { id: 'usr-tailor-2', name: 'Priya Verma', email: 'priya@boutique.com', phone: '9876543211', role: 'TAILOR', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', loc: 'Jubilee Hills, Hyderabad', is_demo: 0 },
    { id: 'usr-tailor-3', name: 'K. Venkatesh', email: 'venkatesh@saichoice.com', phone: '9876543212', role: 'TAILOR', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', loc: 'Ameerpet, Hyderabad', is_demo: 0 },
    { id: 'usr-tailor-4', name: 'Sunita Sharma', email: 'sunita@craftcouture.com', phone: '9876543213', role: 'TAILOR', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', loc: 'Madhapur, Hyderabad', is_demo: 0 },
    { id: 'usr-tailor-5', name: 'Mohd. Ibrahim', email: 'ibrahim@royalfit.com', phone: '9876543214', role: 'TAILOR', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', loc: 'Charminar, Hyderabad', is_demo: 0 },

    // Customers
    { id: 'usr-cust-1', name: 'Vikram Reddy', email: 'vikram@gmail.com', phone: '9123456789', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', loc: 'Hitec City, Hyderabad', is_demo: 0 },
    { id: 'usr-cust-2', name: 'Ananya Rao', email: 'ananya@gmail.com', phone: '9123456790', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', loc: 'Gachibowli, Hyderabad', is_demo: 0 },
    { id: 'usr-cust-3', name: 'Rajesh Sharma', email: 'rajesh@gmail.com', phone: '9123456791', role: 'CUSTOMER', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', loc: 'Kukatpally, Hyderabad', is_demo: 0 },
    { id: 'usr-cust-4', name: 'Sneha Kapoor', email: 'sneha@gmail.com', phone: '9123456792', role: 'CUSTOMER', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', loc: 'Kondapur, Hyderabad', is_demo: 0 },
    { id: 'usr-cust-5', name: 'Arjun Das', email: 'arjun@gmail.com', phone: '9123456793', role: 'CUSTOMER', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', loc: 'Begumpet, Hyderabad', is_demo: 0 },
    { id: 'usr-cust-6', name: 'Meera Naidu', email: 'meera@gmail.com', phone: '9123456794', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', loc: 'Secunderabad, Hyderabad', is_demo: 0 }
  ];

  for (const u of prodUsers) {
    await db.run(
      `INSERT OR REPLACE INTO users (id, name, email, phone, role, language, profile_image, location, password_hash, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.phone, u.role, u.language, u.img || null, u.loc || null, u.pass, u.is_demo]
    );
  }

  // Production Tailor Profiles
  const prodTailors = [
    {
      id: 'prof-tailor-1',
      user_id: 'usr-tailor-1',
      shop_name: 'Ramesh Master Tailors & Clothiers',
      description: 'Specializing in bespoke men formal suits, shirts, and royal wedding kurtas since 1998. Expert fit guaranteed.',
      address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
      latitude: 17.4156,
      longitude: 78.4347,
      working_hours: '9:30 AM - 8:30 PM (Sun Closed)',
      rating: 4.9,
      review_count: 128,
      starting_price: 450,
      shop_images: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80'
      ]),
      categories: JSON.stringify(['Men', 'Shirt', 'Pant', 'Suit', 'Kurta', 'Alterations']),
      is_demo: 0
    },
    {
      id: 'prof-tailor-2',
      user_id: 'usr-tailor-2',
      shop_name: 'Royal Bridal & Designer Boutique',
      description: 'Custom bridal blouses, lehengas, and ethnic wear with intricate embroidery and modern cuts.',
      address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana',
      latitude: 17.4319,
      longitude: 78.4071,
      working_hours: '10:00 AM - 8:00 PM (Daily)',
      rating: 4.8,
      review_count: 94,
      starting_price: 650,
      shop_images: JSON.stringify([
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80'
      ]),
      categories: JSON.stringify(['Women', 'Blouse', 'Dress', 'Kurta', 'Alterations']),
      is_demo: 0
    },
    {
      id: 'prof-tailor-3',
      user_id: 'usr-tailor-3',
      shop_name: 'Sai Choice Gents Tailors',
      description: 'Fast turn-around stitching for office formals, safari suits, and precise alterations.',
      address: 'Main Road, Ameerpet, Hyderabad, Telangana',
      latitude: 17.4375,
      longitude: 78.4483,
      working_hours: '9:00 AM - 9:00 PM',
      rating: 4.6,
      review_count: 72,
      starting_price: 350,
      shop_images: JSON.stringify([
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
      ]),
      categories: JSON.stringify(['Men', 'Shirt', 'Pant', 'Uniform', 'Alterations']),
      is_demo: 0
    }
  ];

  for (const t of prodTailors) {
    await db.run(
      `INSERT OR REPLACE INTO tailor_profiles
       (id, user_id, shop_name, description, address, latitude, longitude, working_hours, rating, review_count, starting_price, shop_images, categories, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.user_id, t.shop_name, t.description, t.address, t.latitude, t.longitude, t.working_hours, t.rating, t.review_count, t.starting_price, t.shop_images, t.categories, t.is_demo]
    );
  }

  // Production Customers mapping in `customers` table
  const prodCustomerLinks = [
    { id: 'clink-1', user_id: 'usr-cust-1', tailor_id: 'prof-tailor-1', notes: 'VIP Client - prefers Italian fabrics with 0.5-inch collar ease', is_demo: 0 },
    { id: 'clink-2', user_id: 'usr-cust-2', tailor_id: 'prof-tailor-1', notes: 'Frequent customer for silk kurtas and festive wear', is_demo: 0 },
    { id: 'clink-3', user_id: 'usr-cust-3', tailor_id: 'prof-tailor-1', notes: 'Prefers formal safari suits with double pockets', is_demo: 0 },
    { id: 'clink-4', user_id: 'usr-cust-4', tailor_id: 'prof-tailor-2', notes: 'Bridal wear specialist client', is_demo: 0 },
    { id: 'clink-5', user_id: 'usr-cust-5', tailor_id: 'prof-tailor-3', notes: 'Office uniform & formal pants client', is_demo: 0 }
  ];

  for (const cl of prodCustomerLinks) {
    await db.run(
      `INSERT OR REPLACE INTO customers (id, user_id, tailor_id, notes, is_demo)
       VALUES (?, ?, ?, ?, ?)`,
      [cl.id, cl.user_id, cl.tailor_id, cl.notes, cl.is_demo]
    );
  }

  // Production Services
  const prodServices = [
    { id: 'srv-1', tailor_id: 'prof-tailor-1', name: 'Custom Formal Shirt Stitching', desc: 'Perfect fit custom shirt with choice of collar & cuff style', price: 450, days: 3, cat: 'Shirt', is_demo: 0 },
    { id: 'srv-2', tailor_id: 'prof-tailor-1', name: 'Formal Trousers / Pant', desc: 'Single or double pleat formal trousers with lining', price: 550, days: 4, cat: 'Pant', is_demo: 0 },
    { id: 'srv-3', tailor_id: 'prof-tailor-1', name: 'Wedding Kurta Pyjama Set', desc: 'Bespoke silk or linen kurta with matching pyjama', price: 1200, days: 5, cat: 'Kurta', is_demo: 0 },
    { id: 'srv-4', tailor_id: 'prof-tailor-1', name: '2-Piece Formal Blazer Suit', desc: 'Precision canvas construction blazer and trousers', price: 3500, days: 7, cat: 'Suit', is_demo: 0 }
  ];

  for (const s of prodServices) {
    await db.run(
      `INSERT OR REPLACE INTO services (id, tailor_id, name, description, price, duration_days, category, is_active, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [s.id, s.tailor_id, s.name, s.desc, s.price, s.days, s.cat, s.is_demo]
    );
  }

  // Production Measurements
  const prodMeasurements = [
    {
      id: 'meas-1',
      customer_id: 'usr-cust-1',
      profile_name: 'Regular Formal Shirt',
      garment_category: 'Shirt',
      version: 2,
      is_default: 1,
      is_demo: 0,
      data: JSON.stringify({
        upper_body: { chest: 40, shoulder: 17.5, neck: 15.5, sleeve: 25, armhole: 18, shirt_length: 29.5, bicep: 14, wrist: 8 },
        lower_body: {},
        custom_measurements: [{ name: 'Collar Loose', value: 0.5, unit: 'inches' }]
      })
    },
    {
      id: 'meas-2',
      customer_id: 'usr-cust-1',
      profile_name: 'Slim Fit Formal Trousers',
      garment_category: 'Pant',
      version: 1,
      is_default: 0,
      is_demo: 0,
      data: JSON.stringify({
        upper_body: {},
        lower_body: { waist: 34, hip: 40, thigh: 24, knee: 17, bottom: 14.5, pant_length: 41, rise: 10.5 },
        custom_measurements: []
      })
    }
  ];

  for (const m of prodMeasurements) {
    await db.run(
      `INSERT OR REPLACE INTO measurements (id, customer_id, profile_name, garment_category, measurement_data, version, is_default, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.customer_id, m.profile_name, m.garment_category, m.data, m.version, m.is_default, m.is_demo]
    );
    await db.run(
      `INSERT OR REPLACE INTO measurement_history (id, measurement_id, measurement_data, changed_by, version)
       VALUES (?, ?, ?, ?, ?)`,
      [`hist-${m.id}`, m.id, m.data, m.customer_id, m.version]
    );
  }

  // Production Orders
  const prodOrders = [
    {
      id: 'ord-101',
      order_number: 'TH-2026-000101',
      customer_id: 'usr-cust-1',
      tailor_id: 'prof-tailor-1',
      garment_type: 'Shirt',
      measurement_id: 'meas-1',
      status: 'STITCHING',
      fabric_option: 'CUSTOMER_PROVIDED',
      total_amount: 900,
      advance_amount: 450,
      balance_amount: 450,
      delivery_date: '2026-09-02',
      instructions: 'Please add double stitching on collar and slim cuff fit.',
      is_demo: 0
    }
  ];

  for (const o of prodOrders) {
    await db.run(
      `INSERT OR REPLACE INTO orders
       (id, order_number, customer_id, tailor_id, garment_type, measurement_id, status, fabric_option, total_amount, advance_amount, balance_amount, delivery_date, instructions, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, o.order_number, o.customer_id, o.tailor_id, o.garment_type, o.measurement_id, o.status, o.fabric_option, o.total_amount, o.advance_amount, o.balance_amount, o.delivery_date, o.instructions, o.is_demo]
    );

    await db.run(
      `INSERT OR REPLACE INTO order_status_history (id, order_id, status, changed_by, changed_by_name, notes, created_at)
       VALUES (?, ?, 'STITCHING', 'usr-tailor-1', 'Ramesh Kumar', 'Order in progress', CURRENT_TIMESTAMP)`,
      [`h-${o.id}`, o.id]
    );
  }

  // =========================================================================
  // 2. ISOLATED DEMO DATASET (is_demo = 1, EXACTLY 10 DEMO CUSTOMERS)
  // =========================================================================
  await seedDemoData(db, passwordHash, adminHash);

  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('Database seeding complete: Production & Demo datasets ready.');
}

export async function seedDemoData(db: any, passwordHash?: string, adminHash?: string) {
  const pHash = passwordHash || (await bcrypt.hash('password123', 10));
  const aHash = adminHash || (await bcrypt.hash('admin123', 10));

  // Demo Admin
  await db.run(
    `INSERT OR REPLACE INTO users (id, name, email, phone, role, language, profile_image, location, password_hash, is_demo)
     VALUES ('usr-demo-admin', 'Demo Administrator', 'demo.admin@tailorhub.demo', '9800000000', 'ADMIN', 'en', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Demo Cloud', ?, 1)`,
    [aHash]
  );

  // Demo Tailor
  await db.run(
    `INSERT OR REPLACE INTO users (id, name, email, phone, role, language, profile_image, location, password_hash, is_demo)
     VALUES ('usr-demo-tailor-1', 'Demo Master Tailor Ramesh', 'demo.tailor@tailorhub.demo', '9800000100', 'TAILOR', 'en', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Demo Studio, Banjara Hills', ?, 1)`,
    [pHash]
  );

  await db.run(
    `INSERT OR REPLACE INTO tailor_profiles (id, user_id, shop_name, description, address, latitude, longitude, working_hours, rating, review_count, starting_price, shop_images, categories, is_demo)
     VALUES ('prof-demo-tailor-1', 'usr-demo-tailor-1', 'Demo Elegance Bespoke Studio', 'Interactive demonstration bespoke shop showcasing TailorHub features.', '100 Demo Boulevard, Hyderabad', 17.4156, 78.4347, '9:00 AM - 8:00 PM', 5.0, 48, 450, '[]', '["Men", "Women", "Suits", "Kurtas", "Blouses"]', 1)`
  );

  // Demo Services
  await db.run(
    `INSERT OR REPLACE INTO services (id, tailor_id, name, description, price, duration_days, category, is_active, is_demo)
     VALUES 
     ('srv-demo-1', 'prof-demo-tailor-1', 'Demo Formal Shirt', 'Standard Demo Fit Shirt', 450, 3, 'Shirt', 1, 1),
     ('srv-demo-2', 'prof-demo-tailor-1', 'Demo Formal Trousers', 'Classic Fit Trousers', 550, 4, 'Pant', 1, 1),
     ('srv-demo-3', 'prof-demo-tailor-1', 'Demo Royal Kurta Set', 'Embroidered Kurta Pyjama', 1400, 5, 'Kurta', 1, 1)`
  );

  // EXACTLY 10 DEMO CUSTOMERS
  const demoCustomers = [
    { num: '01', name: 'Demo Customer 01 (Aarav Mehta)', email: 'demo.cust01@tailorhub.demo', phone: '9800000001', garment: 'Shirt', chest: 38, waist: 32, shoulder: 17.5, sleeve: 24.5, orderPrice: 900, orderStatus: 'STITCHING' },
    { num: '02', name: 'Demo Customer 02 (Pooja Hegde)', email: 'demo.cust02@tailorhub.demo', phone: '9800000002', garment: 'Blouse', chest: 34, waist: 28, shoulder: 14.0, sleeve: 11.0, orderPrice: 1200, orderStatus: 'READY' },
    { num: '03', name: 'Demo Customer 03 (Siddharth Rao)', email: 'demo.cust03@tailorhub.demo', phone: '9800000003', garment: 'Kurta', chest: 42, waist: 36, shoulder: 18.5, sleeve: 25.5, orderPrice: 1800, orderStatus: 'ORDER_PLACED' },
    { num: '04', name: 'Demo Customer 04 (Kavita Krishnan)', email: 'demo.cust04@tailorhub.demo', phone: '9800000004', garment: 'Dress', chest: 36, waist: 30, shoulder: 15.0, sleeve: 18.0, orderPrice: 2200, orderStatus: 'CUTTING' },
    { num: '05', name: 'Demo Customer 05 (Rohan Varma)', email: 'demo.cust05@tailorhub.demo', phone: '9800000005', garment: 'Suit', chest: 40, waist: 34, shoulder: 18.0, sleeve: 25.0, orderPrice: 4500, orderStatus: 'MEASUREMENT_CONFIRMED' },
    { num: '06', name: 'Demo Customer 06 (Divya Sharma)', email: 'demo.cust06@tailorhub.demo', phone: '9800000006', garment: 'Blouse', chest: 36, waist: 29, shoulder: 14.5, sleeve: 10.5, orderPrice: 1500, orderStatus: 'COMPLETED' },
    { num: '07', name: 'Demo Customer 07 (Manoj Tiwari)', email: 'demo.cust07@tailorhub.demo', phone: '9800000007', garment: 'Pant', chest: 42, waist: 36, shoulder: 19.0, sleeve: 26.0, orderPrice: 850, orderStatus: 'OUT_FOR_DELIVERY' },
    { num: '08', name: 'Demo Customer 08 (Neha Agarwal)', email: 'demo.cust08@tailorhub.demo', phone: '9800000008', garment: 'Kurta', chest: 34, waist: 28, shoulder: 14.0, sleeve: 22.0, orderPrice: 1600, orderStatus: 'QUALITY_CHECK' },
    { num: '09', name: 'Demo Customer 09 (Aditya Nambiar)', email: 'demo.cust09@tailorhub.demo', phone: '9800000009', garment: 'Shirt', chest: 44, waist: 38, shoulder: 19.5, sleeve: 26.5, orderPrice: 950, orderStatus: 'ORDER_ACCEPTED' },
    { num: '10', name: 'Demo Customer 10 (Swathi Reddy)', email: 'demo.cust10@tailorhub.demo', phone: '9800000010', garment: 'Suit', chest: 38, waist: 32, shoulder: 16.0, sleeve: 23.5, orderPrice: 3800, orderStatus: 'FABRIC_RECEIVED' }
  ];

  for (const dc of demoCustomers) {
    const userId = `usr-demo-cust-${dc.num}`;
    const measId = `meas-demo-${dc.num}`;
    const ordId = `ord-demo-${dc.num}`;
    const ordNum = `TH-DEMO-${1000 + parseInt(dc.num, 10)}`;

    // User
    await db.run(
      `INSERT OR REPLACE INTO users (id, name, email, phone, role, language, profile_image, location, password_hash, is_demo)
       VALUES (?, ?, ?, ?, 'CUSTOMER', 'en', null, 'Demo City', ?, 1)`,
      [userId, dc.name, dc.email, dc.phone, pHash]
    );

    // Customer link
    await db.run(
      `INSERT OR REPLACE INTO customers (id, user_id, tailor_id, notes, is_demo)
       VALUES (?, ?, 'prof-demo-tailor-1', 'Demo Customer profile with pre-configured orders', 1)`,
      [`cust-demo-link-${dc.num}`, userId]
    );

    // Measurement
    const measData = JSON.stringify({
      upper_body: { chest: dc.chest, shoulder: dc.shoulder, sleeve: dc.sleeve, neck: 16, shirt_length: 30 },
      lower_body: { waist: dc.waist, hip: dc.chest + 2, pant_length: 40, bottom: 15 }
    });

    await db.run(
      `INSERT OR REPLACE INTO measurements (id, customer_id, profile_name, garment_category, measurement_data, version, is_default, is_demo)
       VALUES (?, ?, ?, ?, ?, 1, 1, 1)`,
      [measId, userId, `${dc.garment} (Demo Profile)`, dc.garment, measData]
    );

    // Order
    await db.run(
      `INSERT OR REPLACE INTO orders (id, order_number, customer_id, tailor_id, garment_type, measurement_id, status, fabric_option, total_amount, advance_amount, balance_amount, delivery_date, instructions, is_demo)
       VALUES (?, ?, ?, 'prof-demo-tailor-1', ?, ?, ?, 'CUSTOMER_PROVIDED', ?, ?, 0, '2026-10-05', 'Demo order instructions', 1)`,
      [ordId, ordNum, userId, dc.garment, measId, dc.orderStatus, dc.orderPrice, dc.orderPrice]
    );

    // Payment
    await db.run(
      `INSERT OR REPLACE INTO payments (id, order_id, customer_id, tailor_id, amount, transaction_id, payment_method, status, is_demo)
       VALUES (?, ?, ?, 'prof-demo-tailor-1', ?, ?, 'RAZORPAY', 'SUCCESS', 1)`,
      [`pay-demo-${dc.num}`, ordId, userId, dc.orderPrice, `txn_demo_${1000 + parseInt(dc.num, 10)}`]
    );

    // Appointment
    await db.run(
      `INSERT OR REPLACE INTO appointments (id, customer_id, tailor_id, service_id, date, start_time, end_time, appointment_type, status, notes, is_demo)
       VALUES (?, ?, 'prof-demo-tailor-1', 'srv-demo-1', '2026-10-02', '10:00 AM', '10:30 AM', 'FITTING', 'CONFIRMED', 'Demo fitting appointment', 1)`,
      [`apt-demo-${dc.num}`, userId]
    );
  }
}

/**
 * Wipe and re-seed only the demo records without touching production data
 */
export async function resetDemoDatabase() {
  const db = await getDatabase();
  console.log('[DemoMode] Resetting isolated demo database records...');

  const tables = ['payments', 'appointments', 'order_status_history', 'orders', 'measurement_history', 'measurements', 'customers', 'services', 'tailor_profiles', 'users'];
  for (const t of tables) {
    try {
      await db.run(`DELETE FROM ${t} WHERE is_demo = 1`);
    } catch (e) {}
  }

  await seedDemoData(db);
  console.log('[DemoMode] Exactly 10 demo customers and demo data restored.');
}
