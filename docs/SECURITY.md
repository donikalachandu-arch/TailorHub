# 🔐 TAILORHUB — ENTERPRISE SECURITY & COMPLIANCE ARCHITECTURE

**Classification:** High-Assurance SaaS Security Protocol  
**Standards Alignment:** OWASP Top 10 API Security, ISO 27001, PCI-DSS Level 4 Compliant Architecture

---

## 🛡️ 1. Authentication & Token Lifecycle

### 1.1 Password Security
- Passwords are salted and hashed using **Bcrypt (10 rounds)** before database persistence.
- Raw passwords are never logged, transmitted in plain text, or cached in application memory.

### 1.2 JWT Token Management
- Authentication tokens are signed with **HMAC-SHA256 (HS256)** using a 256-bit cryptographically random secret.
- Token expiration is strictly enforced (7-day standard lifetime).
- Tokens encode `user.id`, `user.email`, `user.role`, and `user.name`.

---

## 🚦 2. Multi-Tier Role-Based Access Control (RBAC)

Middleware enforcement via `authorizeRoles(...)` on all protected endpoints:

| Role | Permissions |
| :--- | :--- |
| `CUSTOMER` | Place orders, access own measurement vault, make payments, book appointments, view assigned tailor profiles. |
| `TAILOR` | Manage own shop catalog, view and transition assigned orders, digitize ledger books with Lens OCR, view boutique metrics. |
| `STAFF` | Role-specific views (e.g., `CUTTER` views cutting queue, `STITCHER` views assembly queue, `QC` performs quality check). |
| `SHOP_MANAGER` | Shop staff registration, inventory overview, appointment reassignments, shop pricing configuration. |
| `ADMIN / SUPER_ADMIN` | Platform telemetry, tailor identity verification, dispute mediation, global fee configuration. |

---

## 🔒 3. Defensive Controls & Hardening

### 3.1 HTTP Security Headers (Helmet)
```typescript
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);
```
- Blocks MIME-type sniffing (`X-Content-Type-Options: nosniff`).
- Disables DNS prefetching (`X-DNS-Prefetch-Control: off`).
- Protects against clickjacking (`X-Frame-Options: SAMEORIGIN`).
- Enforces strict transport security (`Strict-Transport-Security`).

### 3.2 Dynamic Rate Limiting (`express-rate-limit`)
- **Global API Rate Limit:** 1,000 requests per 15-minute window per IP.
- **Authentication Rate Limit:** 100 requests per 15-minute window per IP on `/api/auth/*` to prevent brute-force credential stuffing.

### 3.3 Cryptographic Payment Security (HMAC-SHA256)
All Razorpay checkout callbacks and server webhooks are validated using constant-time cryptographic HMAC checks:
```typescript
const generatedSignature = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const isValid = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(receivedSignature));
```
- Defends against timing attacks and counterfeit transaction receipts.
- Ensures zero unauthorized order fulfillment without authentic financial settlement.

### 3.4 SQL Injection Defense
- 100% of database queries utilize parameterized SQL statements (`?` placeholders with bound value arrays).
- No dynamic string concatenation for SQL execution.
