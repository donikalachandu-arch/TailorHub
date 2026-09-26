# 🔍 TAILORHUB — COMPLETE API AUDIT & ENDPOINT MATRIX

**Auditor:** Senior Full-Stack, Security & QA Engineering Team  
**Evaluation Date:** September 26, 2026  
**Coverage:** 100% of Backend Routes Audited & Tested

---

## 📑 API Route Audit Table

| Endpoint | Method | Auth Required | Role | Database Operation | Production Status | Test Suite |
| :--- | :---: | :---: | :---: | :--- | :---: | :--- |
| `/api/auth/register` | `POST` | No | Public | `INSERT INTO users` | 🟢 Verified | Unit & Manual Auth |
| `/api/auth/login` | `POST` | No | Public | `SELECT users` + Bcrypt compare | 🟢 Verified | Test 2 |
| `/api/auth/profile` | `GET` | Yes | All | `SELECT users WHERE id = ?` | 🟢 Verified | Unit Token Check |
| `/api/tailors` | `GET` | No | Public | `SELECT tailor_profiles` | 🟢 Verified | Test 3 |
| `/api/tailors/:id` | `GET` | No | Public | `SELECT tailor_profiles WHERE id = ?` | 🟢 Verified | Catalog Test |
| `/api/tailors/:id/services` | `GET` | No | Public | `SELECT services WHERE tailor_id = ?` | 🟢 Verified | Catalog Test |
| `/api/services` | `POST` | Yes | Tailor/Admin | `INSERT INTO services` | 🟢 Verified | Catalog Test |
| `/api/tailor/customers` | `GET` | Yes | Tailor/Staff | `SELECT users LEFT JOIN customers` | 🟢 Verified (Bug A Fixed) | Test 3 |
| `/api/tailor/customers/:id` | `GET` | Yes | Tailor/Staff | `SELECT users, measurements, orders` | 🟢 Verified (Bug A Fixed) | Test 3 & Test 4 |
| `/api/tailor/customers/:id` | `PATCH`| Yes | Tailor/Staff | `UPDATE users, customers` | 🟢 Verified | Test 4 |
| `/api/tailor/customers/manual` | `POST` | Yes | Tailor/Staff | `INSERT users, customers, measurements` | 🟢 Verified | CRM Test |
| `/api/measurements` | `GET` | Yes | Customer/Tailor | `SELECT measurements` | 🟢 Verified | Test 12 |
| `/api/measurements` | `POST` | Yes | Customer/Tailor | `INSERT measurements, history` | 🟢 Verified | Test 12 |
| `/api/measurements/:id` | `PATCH`| Yes | Customer/Tailor | `UPDATE measurements, INSERT history` | 🟢 Verified | Test 12 |
| `/api/orders` | `GET` | Yes | Customer/Tailor | `SELECT orders` | 🟢 Verified | Test 8 |
| `/api/orders/:id` | `GET` | Yes | Customer/Tailor | `SELECT orders, history, designs` | 🟢 Verified | Test 8 |
| `/api/orders` | `POST` | Yes | Customer/Tailor | `INSERT orders, status_history` | 🟢 Verified | Test 8 |
| `/api/orders/:id/status` | `PATCH`| Yes | Tailor/Staff/Admin | 11-Stage State Machine Transition | 🟢 Verified | Test 8 |
| `/api/appointments` | `GET` | Yes | Customer/Tailor | `SELECT appointments` | 🟢 Verified | Appointment Suite |
| `/api/appointments` | `POST` | Yes | Customer | Atomic Double-Booking Check + Insert | 🟢 Verified | Conflict Test |
| `/api/appointments/:id/status` | `PATCH`| Yes | Tailor/Admin | `UPDATE appointments SET status` | 🟢 Verified | Appointment Suite |
| `/api/lens/scan` | `POST` | Yes | Tailor/Staff | Tesseract.js OCR + Shorthand Lexer | 🟢 Verified | Test 9 |
| `/api/lens/check-duplicate` | `POST` | Yes | Tailor/Staff | Phone Proximity & Levenshtein Check | 🟢 Verified | Test 9 |
| `/api/lens/verify-save` | `POST` | Yes | Tailor/Staff | Commit Scanned Record & Customer | 🟢 Verified | Lens Suite |
| `/api/lens/records` | `GET` | Yes | Tailor/Staff | `SELECT scanned_records` | 🟢 Verified | Lens Suite |
| `/api/lens/records/:id` | `GET` | Yes | Tailor/Staff | `SELECT scanned_records, audit_logs` | 🟢 Verified | Lens Suite |
| `/api/ai/style-recommendation`| `POST` | Yes | All | Gemini LLM + Zod Schema Validation | 🟢 Verified | Test 11 |
| `/api/payments/create-order` | `POST` | Yes | Customer/Tailor | Razorpay SDK Order Creation | 🟢 Verified | Test 10 |
| `/api/payments/verify-signature` | `POST` | Yes | Customer/Tailor | Cryptographic HMAC-SHA256 Check | 🟢 Verified | Test 10 |
| `/api/payments/webhook` | `POST` | Gateway | System | Timing-Safe Webhook HMAC Check | 🟢 Verified | Payment Suite |
| `/api/payments/create` | `POST` | Yes | Customer/Tailor | ACID Transactional Cash Recording | 🟢 Verified | Test 10 |
| `/api/tailors/:tailorId/staff` | `GET` | Yes | Tailor/Manager | `SELECT staff` | 🟢 Verified | Staff Suite |
| `/api/tailors/:tailorId/staff` | `POST` | Yes | Tailor/Manager | `INSERT staff` | 🟢 Verified | Staff Suite |
| `/api/tailors/:tailorId/staff/:id`| `DELETE`| Yes | Tailor/Manager | `DELETE staff` | 🟢 Verified | Staff Suite |
| `/api/analytics/dashboard` | `GET` | Yes | Tailor/Admin | Dynamic SQL Aggregation Queries | 🟢 Verified | Test 5 |
| `/api/admin/users` | `GET` | Yes | Admin/Super | `SELECT users WHERE is_demo = ?` | 🟢 Verified (Bug B Fixed) | Test 5 |
| `/api/admin/tailors` | `GET` | Yes | Admin/Super | `SELECT tailor_profiles` | 🟢 Verified (Bug B Fixed) | Test 5 |
| `/api/admin/tailors/:id/verify` | `PATCH`| Yes | Admin/Super | `UPDATE tailor_profiles SET rating` | 🟢 Verified | Admin Suite |
| `/api/admin/orders` | `GET` | Yes | Admin/Super | `SELECT orders` | 🟢 Verified (Bug B Fixed) | Test 5 |
| `/api/admin/audit-logs` | `GET` | Yes | Admin/Super | `SELECT audit_logs` | 🟢 Verified | Admin Suite |
| `/api/admin/reset-demo` | `POST` | Yes | Admin/Super | Reset isolated demo dataset | 🟢 Verified | Test 6 & 7 |
| `/api/demo/reset` | `POST` | No | Public / Demo | Wipe and restore 10 demo customers | 🟢 Verified | Test 6 & 7 |
| `/health` | `GET` | No | Public | Returns service status & env | 🟢 Verified | System Health |
