import { getDatabase } from './database';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDatabase();
  console.log('Seeding TailorHub database with authentic startup data...');

  await db.exec('PRAGMA foreign_keys = OFF;');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // 1. Users
  const users = [
    { id: 'usr-admin-1', name: 'Platform Admin', email: 'admin@tailorhub.com', phone: '9000000000', role: 'ADMIN', language: 'en', pass: adminHash },
    
    // Tailors
    { id: 'usr-tailor-1', name: 'Ramesh Kumar', email: 'ramesh@tailors.com', phone: '9876543210', role: 'TAILOR', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', loc: 'Banjara Hills, Hyderabad' },
    { id: 'usr-tailor-2', name: 'Priya Verma', email: 'priya@boutique.com', phone: '9876543211', role: 'TAILOR', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', loc: 'Jubilee Hills, Hyderabad' },
    { id: 'usr-tailor-3', name: 'K. Venkatesh', email: 'venkatesh@saichoice.com', phone: '9876543212', role: 'TAILOR', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', loc: 'Ameerpet, Hyderabad' },
    { id: 'usr-tailor-4', name: 'Sunita Sharma', email: 'sunita@craftcouture.com', phone: '9876543213', role: 'TAILOR', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', loc: 'Madhapur, Hyderabad' },
    { id: 'usr-tailor-5', name: 'Mohd. Ibrahim', email: 'ibrahim@royalfit.com', phone: '9876543214', role: 'TAILOR', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', loc: 'Charminar, Hyderabad' },

    // Customers
    { id: 'usr-cust-1', name: 'Vikram Reddy', email: 'vikram@gmail.com', phone: '9123456789', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', loc: 'Hitec City, Hyderabad' },
    { id: 'usr-cust-2', name: 'Ananya Rao', email: 'ananya@gmail.com', phone: '9123456790', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', loc: 'Gachibowli, Hyderabad' },
    { id: 'usr-cust-3', name: 'Rajesh Sharma', email: 'rajesh@gmail.com', phone: '9123456791', role: 'CUSTOMER', language: 'hi', pass: passwordHash, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', loc: 'Kukatpally, Hyderabad' },
    { id: 'usr-cust-4', name: 'Sneha Kapoor', email: 'sneha@gmail.com', phone: '9123456792', role: 'CUSTOMER', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', loc: 'Kondapur, Hyderabad' },
    { id: 'usr-cust-5', name: 'Arjun Das', email: 'arjun@gmail.com', phone: '9123456793', role: 'CUSTOMER', language: 'en', pass: passwordHash, img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', loc: 'Begumpet, Hyderabad' },
    { id: 'usr-cust-6', name: 'Meera Naidu', email: 'meera@gmail.com', phone: '9123456794', role: 'CUSTOMER', language: 'te', pass: passwordHash, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', loc: 'Secunderabad, Hyderabad' }
  ];

  for (const u of users) {
    await db.run(
      `INSERT OR REPLACE INTO users (id, name, email, phone, role, language, profile_image, location, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.phone, u.role, u.language, u.img || null, u.loc || null, u.pass]
    );
  }

  // 2. Tailor Profiles
  const tailors = [
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
      categories: JSON.stringify(['Men', 'Shirt', 'Pant', 'Suit', 'Kurta', 'Alterations'])
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
      categories: JSON.stringify(['Women', 'Blouse', 'Dress', 'Kurta', 'Alterations'])
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
      categories: JSON.stringify(['Men', 'Shirt', 'Pant', 'Uniform', 'Alterations'])
    },
    {
      id: 'prof-tailor-4',
      user_id: 'usr-tailor-4',
      shop_name: 'Craft Couture Fashion & Alteration Studio',
      description: 'Designer fits for men, women & kids. Specializing in suit alterations and express 24-hour emergency stitching.',
      address: 'Near Cyber Towers, Madhapur, Hyderabad, Telangana',
      latitude: 17.4504,
      longitude: 78.3808,
      working_hours: '10:00 AM - 9:00 PM',
      rating: 4.7,
      review_count: 65,
      starting_price: 400,
      shop_images: JSON.stringify([
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80'
      ]),
      categories: JSON.stringify(['Men', 'Women', 'Kids', 'Alterations', 'Suit', 'Blouse'])
    },
    {
      id: 'prof-tailor-5',
      user_id: 'usr-tailor-5',
      shop_name: 'Royal Heritage Sherwani & Kurta Palace',
      description: 'Handcrafted royal sherwanis, kurtas, and traditional Hyderabadi wedding wear with zardozi work.',
      address: 'Near Charminar, Hyderabad, Telangana',
      latitude: 17.3616,
      longitude: 78.4747,
      working_hours: '11:00 AM - 10:00 PM',
      rating: 4.9,
      review_count: 180,
      starting_price: 800,
      shop_images: JSON.stringify([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
      ]),
      categories: JSON.stringify(['Men', 'Kurta', 'Suit', 'Wedding'])
    }
  ];

  for (const t of tailors) {
    await db.run(
      `INSERT OR REPLACE INTO tailor_profiles
       (id, user_id, shop_name, description, address, latitude, longitude, working_hours, rating, review_count, starting_price, shop_images, categories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.user_id, t.shop_name, t.description, t.address, t.latitude, t.longitude, t.working_hours, t.rating, t.review_count, t.starting_price, t.shop_images, t.categories]
    );
  }

  // 3. Services
  const services = [
    { id: 'srv-1', tailor_id: 'prof-tailor-1', name: 'Custom Formal Shirt Stitching', desc: 'Perfect fit custom shirt with choice of collar & cuff style', price: 450, days: 3, cat: 'Shirt' },
    { id: 'srv-2', tailor_id: 'prof-tailor-1', name: 'Formal Trousers / Pant', desc: 'Single or double pleat formal trousers with lining', price: 550, days: 4, cat: 'Pant' },
    { id: 'srv-3', tailor_id: 'prof-tailor-1', name: 'Wedding Kurta Pyjama Set', desc: 'Bespoke silk or linen kurta with matching pyjama', price: 1200, days: 5, cat: 'Kurta' },
    { id: 'srv-4', tailor_id: 'prof-tailor-1', name: '2-Piece Formal Blazer Suit', desc: 'Precision canvas construction blazer and trousers', price: 3500, days: 7, cat: 'Suit' },
    
    { id: 'srv-5', tailor_id: 'prof-tailor-2', name: 'Designer Padded Blouse', desc: 'Custom neck design, princess cut, and padding', price: 750, days: 4, cat: 'Blouse' },
    { id: 'srv-6', tailor_id: 'prof-tailor-2', name: 'Bridal Heavy Embroidered Blouse', desc: 'Intricate aari and maggam work custom blouse', price: 2500, days: 7, cat: 'Blouse' },
    { id: 'srv-7', tailor_id: 'prof-tailor-2', name: 'Anarkali Suit / Dress', desc: 'Full flair designer Anarkali suit with dupata detailing', price: 1800, days: 6, cat: 'Dress' },
    
    { id: 'srv-8', tailor_id: 'prof-tailor-3', name: 'Formal Shirt Stitching', desc: 'Standard formal cotton shirt', price: 350, days: 2, cat: 'Shirt' },
    { id: 'srv-9', tailor_id: 'prof-tailor-3', name: 'Formal Pant Stitching', desc: 'Durable tailored trousers', price: 400, days: 3, cat: 'Pant' },
    { id: 'srv-10', tailor_id: 'prof-tailor-3', name: 'Pant / Shirt Alterations', desc: 'Quick waist tightening, hem shortening, tapering', price: 150, days: 1, cat: 'Alterations' }
  ];

  for (const s of services) {
    await db.run(
      `INSERT OR REPLACE INTO services (id, tailor_id, name, description, price, duration_days, category, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [s.id, s.tailor_id, s.name, s.desc, s.price, s.days, s.cat]
    );
  }

  // 4. Measurements
  const measurements = [
    {
      id: 'meas-1',
      customer_id: 'usr-cust-1',
      profile_name: 'Regular Formal Shirt',
      garment_category: 'Shirt',
      version: 2,
      is_default: 1,
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
      data: JSON.stringify({
        upper_body: {},
        lower_body: { waist: 34, hip: 40, thigh: 24, knee: 17, bottom: 14.5, pant_length: 41, rise: 10.5 },
        custom_measurements: []
      })
    },
    {
      id: 'meas-3',
      customer_id: 'usr-cust-2',
      profile_name: 'Party Princess Cut Blouse',
      garment_category: 'Blouse',
      version: 1,
      is_default: 1,
      data: JSON.stringify({
        upper_body: { chest: 36, shoulder: 14.5, neck: 7, sleeve: 10.5, armhole: 16, shirt_length: 14 },
        lower_body: { waist: 30 },
        custom_measurements: [{ name: 'Front Neck Depth', value: 7.5, unit: 'inches' }, { name: 'Back Neck Depth', value: 9.5, unit: 'inches' }]
      })
    }
  ];

  for (const m of measurements) {
    await db.run(
      `INSERT OR REPLACE INTO measurements (id, customer_id, profile_name, garment_category, measurement_data, version, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.customer_id, m.profile_name, m.garment_category, m.data, m.version, m.is_default]
    );

    // Initial history log
    await db.run(
      `INSERT OR REPLACE INTO measurement_history (id, measurement_id, measurement_data, changed_by, version)
       VALUES (?, ?, ?, ?, ?)`,
      [`hist-${m.id}`, m.id, m.data, m.customer_id, m.version]
    );
  }

  // 5. Orders & Status History
  const orders = [
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
      instructions: 'Please add double stitching on collar and slim cuff fit.'
    },
    {
      id: 'ord-102',
      order_number: 'TH-2026-000102',
      customer_id: 'usr-cust-2',
      tailor_id: 'prof-tailor-2',
      garment_type: 'Blouse',
      measurement_id: 'meas-3',
      status: 'READY',
      fabric_option: 'CUSTOMER_PROVIDED',
      total_amount: 1500,
      advance_amount: 1500,
      balance_amount: 0,
      delivery_date: '2026-08-30',
      instructions: 'Deep V back neck with golden piping border.'
    },
    {
      id: 'ord-103',
      order_number: 'TH-2026-000103',
      customer_id: 'usr-cust-3',
      tailor_id: 'prof-tailor-3',
      garment_type: 'Pant',
      measurement_id: 'meas-2',
      status: 'COMPLETED',
      fabric_option: 'TAILOR_PROVIDED',
      total_amount: 800,
      advance_amount: 800,
      balance_amount: 0,
      delivery_date: '2026-08-25',
      instructions: 'Navy blue linen trousers.'
    }
  ];

  for (const o of orders) {
    await db.run(
      `INSERT OR REPLACE INTO orders
       (id, order_number, customer_id, tailor_id, garment_type, measurement_id, status, fabric_option, total_amount, advance_amount, balance_amount, delivery_date, instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, o.order_number, o.customer_id, o.tailor_id, o.garment_type, o.measurement_id, o.status, o.fabric_option, o.total_amount, o.advance_amount, o.balance_amount, o.delivery_date, o.instructions]
    );

    // Status Timeline Records
    const statusSequence = ['ORDER_PLACED', 'ORDER_ACCEPTED', 'MEASUREMENT_CONFIRMED', 'FABRIC_RECEIVED', 'CUTTING', 'STITCHING'];
    if (o.status === 'READY') statusSequence.push('QUALITY_CHECK', 'READY');
    if (o.status === 'COMPLETED') statusSequence.push('QUALITY_CHECK', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED');

    for (let idx = 0; idx < statusSequence.length; idx++) {
      const st = statusSequence[idx];
      await db.run(
        `INSERT OR REPLACE INTO order_status_history (id, order_id, status, changed_by, changed_by_name, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${statusSequence.length - idx} days'))`,
        [`h-${o.id}-${st}`, o.id, st, 'usr-tailor-1', 'Ramesh Kumar', `Status updated to ${st}`]
      );
    }
  }

  // 6. Old Register Digitization Demo Records
  const oldRecord = {
    id: 'rec-001',
    tailor_id: 'prof-tailor-1',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    extracted_data: JSON.stringify({
      name: 'Ramesh Naidu',
      phone: '9848022334',
      garment: 'Shirt',
      chest: '42',
      waist: '36',
      sleeve: '24.5',
      neck: '16',
      notes: 'Full sleeves with pocket'
    }),
    confidence_data: JSON.stringify({
      name: { field: 'name', value: 'Ramesh Naidu', confidence: 0.96 },
      phone: { field: 'phone', value: '9848022334', confidence: 0.99 },
      garment: { field: 'garment', value: 'Shirt', confidence: 0.94 },
      chest: { field: 'chest', value: '42', confidence: 0.91 },
      waist: { field: 'waist', value: '36', confidence: 0.88 },
      sleeve: { field: 'sleeve', value: '24.5', confidence: 0.65 }, // low confidence
      neck: { field: 'neck', value: '16', confidence: 0.92 }
    }),
    verification_status: 'PENDING'
  };

  await db.run(
    `INSERT OR REPLACE INTO old_records (id, tailor_id, image_url, extracted_data, confidence_data, verification_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [oldRecord.id, oldRecord.tailor_id, oldRecord.image_url, oldRecord.extracted_data, oldRecord.confidence_data, oldRecord.verification_status]
  );

  // 7. Appointments
  await db.run(
    `INSERT OR REPLACE INTO appointments (id, customer_id, tailor_id, service_id, date, start_time, end_time, appointment_type, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['apt-1', 'usr-cust-1', 'prof-tailor-1', 'srv-1', '2026-09-01', '10:30 AM', '11:00 AM', 'MEASUREMENT', 'CONFIRMED', 'Customer requested fitting consultation']
  );

  // 8. Notifications
  await db.run(
    `INSERT OR REPLACE INTO notifications (id, user_id, title, message, type, is_read)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['notif-1', 'usr-cust-1', 'Order In Stitching Stage', 'Your shirt order TH-2026-000101 is currently on the stitching table.', 'ORDER_STATUS', 0]
  );

  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('Database successfully seeded with TailorHub initial dataset!');
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
}
