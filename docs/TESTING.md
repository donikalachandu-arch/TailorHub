# 🧪 TAILORHUB — TESTING & QUALITY ASSURANCE SPECIFICATION

**Test Framework:** Node.js + TypeScript Verification Runner + End-to-End Test Suite  
**Test Suite File:** `backend/test/api.test.ts`

---

## 📊 1. Verification Test Matrix

| Test ID | Test Category | Target Subsystem | Verification Criterion | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TEST 1** | Database & Migrations | PostgreSQL / SQLite Schema | Seeded 5+ master records, relations intact | ✅ **PASSED** |
| **TEST 2** | Authentication | Bcrypt Hash Engine | Validates hashed passwords and rejects invalid | ✅ **PASSED** |
| **TEST 3** | Discovery & Filtering | Catalog Service | Filters tailors by garment category and location | ✅ **PASSED** |
| **TEST 4** | Versioning & Vault | Measurements | Increments version number and records history snapshot | ✅ **PASSED** |
| **TEST 5** | Order State Machine | Order Workflow Engine | 11-stage status progression and audit trail | ✅ **PASSED** |
| **TEST 6** | Confidence Metrics | Lens OCR Data | Computes field-level OCR confidence percentages | ✅ **PASSED** |
| **TEST 7** | Multi-Customer Seg | TailorHub Lens | Splits multi-customer register ledger pages | ✅ **PASSED** |
| **TEST 8** | Uncertainty Detection| Shorthand Lexer | Flags smudged / ambiguous readings with `?` | ✅ **PASSED** |
| **TEST 9** | CRM Duplicate Match | CRM Deduplication | Detects existing customer by phone and name | ✅ **PASSED** |
| **TEST 10** | Razorpay Order & Sig | Payment Gateway | Creates INR order & verifies HMAC signature | ✅ **PASSED** |
| **TEST 11** | AI Style Assistant | Gemini / Ontology Engine | Validates structured recommendations with Zod | ✅ **PASSED** |
| **TEST 12** | Boutique Staff CRM | Staff Management | Records and lists boutique staff assignments | ✅ **PASSED** |

---

## 🏃 2. How to Run the Verification Suite

```bash
# Navigate to backend directory
cd backend

# Execute automated test suite
npm test
```

### Expected Output:
```
====================================================
Running TailorHub Production Verification Test Suite
====================================================

[TEST 1 PASSED] Seeded Users Count: 6
[TEST 2 PASSED] Password verification for ramesh@tailors.com: true
[TEST 3 PASSED] Discovery filtered tailors count: 3
[TEST 4 PASSED] Measurement Slim Formal Shirt Version: 2, History Logs: 2
[TEST 5 PASSED] Order TH-2026-101 Status: STITCHING, Timeline events: 4
[TEST 6 PASSED] OCR Scan confidence for phone: 94%, sleeve: 94%
[TEST 7 PASSED] Lens Multi-Customer Detection: 2 candidates found.
[TEST 8 PASSED] Unclear Handwriting phone uncertainty detected: true, Confidence: 0.58
[TEST 9 PASSED] Duplicate Detection for existing customer: is_duplicate = true, match = EXACT_PHONE
[TEST 10 PASSED] Razorpay Gateway Order Created: order_1790432, Amount: ₹500
[TEST 10.1 PASSED] Cryptographic Signature Verification: true
[TEST 11 PASSED] AI Style Assistant Title: "Contemporary Bandhgala Kurta"
                 Neckline: Mandarin Collar with intricate contrast thread piping
                 Styling Tips: 3 expert tips generated.
[TEST 12 PASSED] Boutique Staff Registry: 1 active staff members recorded.

====================================================
 All 12 Production Verification Tests Passed Cleanly!
====================================================
```
