# TailorHub — Production PostgreSQL Migration & Deployment Guide

This guide describes the step-by-step procedure for migrating TailorHub from local development SQLite to a fully managed, production-grade PostgreSQL cluster (Supabase, AWS RDS PostgreSQL, or Neon).

---

## 1. Architectural Overview

TailorHub is designed with database portability in mind:
* **Local Development & Demo Testing:** SQLite 3 with strict foreign key pragmas (`PRAGMA foreign_keys = ON`) and indexed `is_demo` columns.
* **Production Deployment:** Managed PostgreSQL 14+ with connection pooling, SSL encryption, UUID extension, and JSONB document support.

Both engines share an identical 19-table schema and transactional semantics.

---

## 2. Pre-Migration Checklist

1. **Provision Target PostgreSQL Instance:**
   * Create a database on Supabase, AWS RDS, or Neon.
   * Note the connection string in the format:
     `postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require`
2. **Backup SQLite Database:**
   ```bash
   cp backend/tailorhub.db backend/tailorhub_backup_$(date +%Y%m%d_%H%M%S).db
   ```
3. **Verify Git Working Tree:**
   Ensure current branch is `main` with all changes committed.

---

## 3. Automated Schema & Initial Seed Deployment

TailorHub provides an automated TypeScript deployment script: `backend/src/scripts/deploySupabaseDb.ts`.

### Run Deployment:
```powershell
cd backend
npx ts-node src/scripts/deploySupabaseDb.ts "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
```

The script will:
1. Establish an SSL connection to your PostgreSQL cluster.
2. Execute `backend/src/config/initPostgres.sql`.
3. Verify that all 19 tables and 15 performance indexes are created.
4. Insert initial production seed data (Master Tailor, Standard Services, First Customer, Platform Administrator) if the database is fresh.

---

## 4. Live Data Migration from SQLite to PostgreSQL

To migrate existing production records from `tailorhub.db`:

### Step 4.1: Export Production Data from SQLite
Export ONLY production records (`is_demo = 0`):
```sql
-- Run inside sqlite3 tailorhub.db
.mode csv
.headers on
.output prod_users.csv
SELECT * FROM users WHERE is_demo = 0;
.output prod_tailor_profiles.csv
SELECT * FROM tailor_profiles WHERE is_demo = 0;
.output prod_services.csv
SELECT * FROM services WHERE is_demo = 0;
.output prod_orders.csv
SELECT * FROM orders WHERE is_demo = 0;
.output prod_measurements.csv
SELECT * FROM measurements WHERE is_demo = 0;
.output prod_payments.csv
SELECT * FROM payments WHERE is_demo = 0;
.output prod_appointments.csv
SELECT * FROM appointments WHERE is_demo = 0;
.quit
```

### Step 4.2: Import into PostgreSQL
Using `psql` or Supabase Table Editor:
```sql
\copy users FROM 'prod_users.csv' WITH (FORMAT csv, HEADER true);
\copy tailor_profiles FROM 'prod_tailor_profiles.csv' WITH (FORMAT csv, HEADER true);
\copy services FROM 'prod_services.csv' WITH (FORMAT csv, HEADER true);
\copy measurements FROM 'prod_measurements.csv' WITH (FORMAT csv, HEADER true);
\copy orders FROM 'prod_orders.csv' WITH (FORMAT csv, HEADER true);
\copy payments FROM 'prod_payments.csv' WITH (FORMAT csv, HEADER true);
\copy appointments FROM 'prod_appointments.csv' WITH (FORMAT csv, HEADER true);
```

---

## 5. Cutover & Environment Switch

Update the backend `.env` configuration:

```env
# Switch DATABASE_URL from SQLite to PostgreSQL
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
NODE_ENV=production
```

Restart the backend service:
```bash
npm run build
npm run start
```

---

## 6. Post-Migration Verification Checklist

| Step | Verification Command / Check | Expected Result |
| :---: | :--- | :--- |
| **1** | `SELECT COUNT(*) FROM users;` | Matches pre-migration user count |
| **2** | `SELECT COUNT(*) FROM orders;` | Matches pre-migration order count |
| **3** | `SELECT SUM(total_amount) FROM orders WHERE is_demo = 0;` | Platform GMV matches exactly |
| **4** | Place a test order via `/orders` API | Order ID returned, status `DRAFT` in DB |
| **5** | Test transaction rollback on payments | Zero ledger discrepancy |

---

## 7. Rollback Strategy

If any failure occurs during cutover:
1. Revert `.env` to point back to SQLite:
   ```env
   DATABASE_URL=file:./tailorhub.db
   ```
2. Restart backend process:
   ```bash
   npm run start
   ```
3. SQLite database will resume serving traffic immediately with zero downtime.
