import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

/**
 * Automated Database Deployment Tool for PostgreSQL & Supabase
 * Usage:
 *   npx ts-node src/scripts/deploySupabaseDb.ts "postgresql://postgres:...@...supabase.com:6543/postgres"
 */
async function runDeployment() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString || connectionString.startsWith('file:')) {
    console.error('❌ Error: Please provide a valid PostgreSQL connection string.');
    console.log('Usage: npm run db:deploy "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL / Supabase Database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read SQL Schema
    const sqlPath = path.join(__dirname, '../config/initPostgres.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing TailorHub production schema (14 tables + indexes)...');
    await client.query(sqlContent);
    console.log('✅ Tables created/verified successfully!');

    // Check if initial users exist
    const userCheck = await client.query('SELECT COUNT(*) as cnt FROM users');
    if (parseInt(userCheck.rows[0].cnt) === 0) {
      console.log('🌱 Seeding initial startup data (Tailors, Services, Customers, Measurements)...');
      const passHash = await bcrypt.hash('password123', 10);
      const adminHash = await bcrypt.hash('admin123', 10);

      // Seed Master Tailor
      await client.query(`
        INSERT INTO users (id, name, email, phone, role, password_hash, location)
        VALUES ('u_tailor_1', 'Ramesh Kumar (Master Tailor)', 'ramesh@tailors.com', '+91 9876543210', 'TAILOR', $1, 'MG Road, Vijayawada')
        ON CONFLICT (id) DO NOTHING;
      `, [passHash]);

      await client.query(`
        INSERT INTO tailor_profiles (id, user_id, shop_name, description, address, latitude, longitude, starting_price, categories)
        VALUES ('tp_1', 'u_tailor_1', 'Ramesh Tailoring & Boutique Studio', 'Specialist in custom men suits, designer kurtas, and traditional wear since 1994.', 'MG Road, Opp Municipal Complex, Vijayawada', 16.5062, 80.6480, 450.0, '["Men","Traditional","Suits","Alterations"]')
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed Services
      await client.query(`
        INSERT INTO services (id, tailor_id, name, description, price, duration_days, category)
        VALUES 
          ('srv_1', 'tp_1', 'Men Formal Shirt Stitching', 'Perfect fit shirt stitching with fusing collar and customized cuffs.', 450.0, 3, 'Men'),
          ('srv_2', 'tp_1', 'Formal Trousers / Pant', 'Custom tailored trousers with premium pocketing and zip finish.', 600.0, 4, 'Men'),
          ('srv_3', 'tp_1', 'Two-Piece Executive Suit', 'Bespoke executive suit with canvas structuring and hand-finished lapels.', 4500.0, 7, 'Suits')
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed Customer
      await client.query(`
        INSERT INTO users (id, name, email, phone, role, password_hash, location)
        VALUES ('u_cust_1', 'Vikram Reddy', 'vikram@gmail.com', '+91 9123456789', 'CUSTOMER', $1, 'Benz Circle, Vijayawada')
        ON CONFLICT (id) DO NOTHING;
      `, [passHash]);

      // Seed Admin
      await client.query(`
        INSERT INTO users (id, name, email, phone, role, password_hash, location)
        VALUES ('u_admin_1', 'TailorHub Administrator', 'admin@tailorhub.com', '+91 9999988888', 'ADMIN', $1, 'Hyderabad')
        ON CONFLICT (id) DO NOTHING;
      `, [adminHash]);

      console.log('✅ Seed data inserted successfully!');
    } else {
      console.log('ℹ️ Database already contains data, skipping seed.');
    }

    console.log('🎉 Supabase / PostgreSQL Database is 100% Ready for Production!');
  } catch (err) {
    console.error('❌ Database deployment error:', err);
  } finally {
    await client.end();
  }
}

runDeployment();
