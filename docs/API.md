# 🌐 TAILORHUB — REST & WEBSOCKET API SPECIFICATION

**Version:** 2.0.0 (Production)  
**Base URL:** `https://api.tailorhub.local/api` (or `/api` in production deployment)  
**Protocols:** HTTPS & WSS (JSON payloads)

---

## 🔒 1. Authentication & Security Headers

All protected endpoints require an HTTP `Authorization` header with a valid JWT Bearer token:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📚 2. Endpoint Reference

### 2.1 Authentication & Profile
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new Customer, Tailor, or Staff account |
| `POST` | `/auth/login` | Public | Authenticate user credentials and issue JWT token |
| `GET` | `/auth/profile` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/auth/profile` | Authenticated | Update user name, phone, language, or avatar |

#### Sample Request: `POST /auth/login`
```json
{
  "email": "ramesh@tailors.com",
  "password": "password123"
}
```
#### Sample Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1",
    "name": "Ramesh Kumar",
    "email": "ramesh@tailors.com",
    "role": "TAILOR",
    "language": "en"
  }
}
```

---

### 2.2 Tailor Discovery & Services
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tailors` | Public | List tailors with category, location, rating filters |
| `GET` | `/tailors/:id` | Public | Get tailor profile, portfolio images, and reviews |
| `GET` | `/tailors/:id/services` | Public | List active tailoring services offered by shop |
| `POST` | `/services` | Tailor/Manager | Create new bespoke service or price package |

---

### 2.3 Order Management & 11-Stage State Machine
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/orders` | Authenticated | List orders (filtered by Customer ID or Tailor ID) |
| `GET` | `/orders/:id` | Authenticated | Get order details, designs, timeline, measurements |
| `POST` | `/orders` | Customer/Tailor | Place a new custom stitching order |
| `PATCH` | `/orders/:id/status` | Tailor/Staff/Admin | Transition order status through validated lifecycle |

#### State Machine Transition Validation:
```json
{
  "status": "CUTTING",
  "notes": "Fabric inspected and marked on cutting table."
}
```
*If an invalid state transition is requested (e.g. `COMPLETED` -> `CUTTING`), the API responds with HTTP 400 Bad Request detailing allowed next states.*

---

### 2.4 TailorHub Lens (OCR Digitization Engine)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/lens/scan` | Tailor/Staff | Upload document image for real Tesseract OCR & segmentation |
| `POST` | `/lens/check-duplicate` | Tailor/Staff | Check phone and name match against customer CRM |
| `POST` | `/lens/verify-save` | Tailor/Staff | Commit verified customer, measurements, and history order |
| `GET` | `/lens/records` | Tailor/Staff | List scanned register sheets and verification status |
| `GET` | `/lens/records/:id` | Tailor/Staff | Get specific scanned ledger with audit trails |

---

### 2.5 Real AI Style Assistant
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/style-recommendation` | Authenticated | Query Gemini LLM / Fashion Ontology for design tips |

#### Request:
```json
{
  "garment": "Kurta Pajama",
  "occasion": "Wedding Reception",
  "color_preference": "Deep Emerald Green",
  "neck_preference": "Mandarin Collar"
}
```

#### Response:
```json
{
  "id": "rec_1790432",
  "recommendation": {
    "title": "Royal Heritage Asymmetric Kurta",
    "neck_design": "Mandarin collar with intricate contrast thread piping and metallic monogram buttons",
    "sleeve_design": "Full sleeve with 2.5-inch French cuff and button placket",
    "pattern_suggestion": "Subtle self-jacquard silk with tone-on-tone thread embroidery",
    "color_combination": "Deep Emerald Green with Raw Silk Antique Gold accents",
    "occasion_suitability": "Perfect for Wedding Reception, family functions, and evening galas",
    "styling_tips": [
      "Pair with mojris in matching raw silk or antique tan leather",
      "Add a folded silk pocket square for a regal touch",
      "Opt for churidar or straight pants with a 1.5-inch hem break"
    ]
  }
}
```

---

### 2.6 Razorpay Payments Gateway
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/create-order` | Authenticated | Create server-signed Razorpay order in INR |
| `POST` | `/payments/verify-signature` | Authenticated | Cryptographically verify HMAC-SHA256 checkout signature |
| `POST` | `/payments/webhook` | Gateway Only | Verify Razorpay webhook signature and record capture |
| `POST` | `/payments/create` | Authenticated | Record direct cash or manual UPI payment receipt |

---

### 2.7 Boutique Multi-Staff Management
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tailors/:tailorId/staff` | Tailor/Manager | List staff members with roles and assignments |
| `POST` | `/tailors/:tailorId/staff` | Tailor/Manager | Register staff member (Cutter, Stitcher, QC, etc.) |
| `DELETE` | `/tailors/:tailorId/staff/:staffId` | Tailor/Manager | Deactivate or remove staff member |

---

## ⚡ 3. WebSocket Real-Time API (`/ws`)

### Client Messages:
- `{"type": "IDENTIFY", "userId": "usr-1"}` — Authenticates client session and binds to `user:usr-1` room.
- `{"type": "SUBSCRIBE_ROOM", "room": "order:ord-101"}` — Subscribes to updates for a specific order.
- `{"type": "SUBSCRIBE_ROOM", "room": "shop:prof-tailor-1"}` — Subscribes to shop events (new orders, appointments).

### Server Broadcast Events:
- `NEW_ORDER` — Broadcast to `shop:<tailor_id>`.
- `ORDER_STATUS_UPDATE` — Broadcast to `order:<id>` and `shop:<tailor_id>`.
- `PAYMENT_RECEIVED` — Broadcast to `order:<id>` and `shop:<tailor_id>`.
- `NEW_APPOINTMENT` — Broadcast to `shop:<tailor_id>`.
