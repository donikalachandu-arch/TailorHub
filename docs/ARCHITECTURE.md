# 🏛️ TAILORHUB — SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION

**Version:** 2.0.0 (Production Release)  
**System Classification:** Multi-Tenant Digital Tailoring & Boutique SaaS Platform  
**Target Availability:** 99.95% SLA

---

## 📑 1. High-Level Architecture Overview

TailorHub is built as a decoupled, multi-tenant cloud application engineered for high-throughput transactional operations, real-time client-tailor collaboration, computer-vision record digitization, and AI-assisted garment customization.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATION TIER                        │
│   React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons + WSS     │
│   [Customer App]   [Tailor Studio]   [Boutique Staff CRM]   [Admin]    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS / WSS
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & SECURITY LAYER                     │
│  - Cloudflare / Vercel Edge Proxy                                      │
│  - Helmet Security Headers & Content Policy                             │
│  - IP & Endpoint Rate Limiting (express-rate-limit)                    │
│  - JWT Bearer Authentication & Multi-Role RBAC / ABAC Guards           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS EXPRESS 4.19 CORE                      │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │
│ │  Auth & Staff  │ │ Order Workflow │ │ Appointment    │ │ Analytics │ │
│ │  Controllers   │ │ State Machine  │ │ Atomic Locking │ │ Engine    │ │
│ └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └─────┬─────┘ │
│         │                  │                  │                │       │
│ ┌───────┴────────┐ ┌───────┴────────┐ ┌───────┴────────┐       │       │
│ │ TailorHub Lens │ │ Gemini AI      │ │ Razorpay       │       │       │
│ │ Tesseract OCR  │ │ Style Engine   │ │ Gateway & HMAC │       │       │
│ └───────┬────────┘ └───────┬────────┘ └───────┬────────┘       │       │
└─────────┼──────────────────┼──────────────────┼────────────────┼───────┘
          ▼                  ▼                  ▼                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE & STORAGE DATA                     │
│  - PostgreSQL 15+ (Supabase / AWS RDS / Fly.io Postgres)               │
│  - Normalized Schema with Foreign Key Constraints & Composite Indices  │
│  - S3 / Supabase Cloud Storage for High-Resolution Tailoring Notebooks  │
│  - Realtime WebSocket Hub with Room Scoping (`shop:id`, `order:id`)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 2. Component Subsystems

### 2.1 Multi-Tenant Roles & Access Hierarchy
- **CUSTOMER**: Order placement, measurement vault access, real-time status tracking, style advice, secure payments.
- **TAILOR / SHOP OWNER**: Shop catalog, order lifecycle execution, appointment approvals, register book digitization, boutique analytics.
- **STAFF (Master Tailor, Cutter, Stitcher, Finisher, QC, Sales)**: Role-tailored views and task assignments.
- **SHOP MANAGER**: Full boutique operational control, inventory, staff delegation, and revenue reporting.
- **ADMIN / SUPER ADMIN**: Platform-wide telemetry, tailor onboarding verification, commission reporting, system audit trails.

### 2.2 TailorHub Lens (Computer Vision Digitization Pipeline)
Transforms multi-decade physical handwritten ledger books into structured digital customer accounts.
1. **Acquisition & Canvas Preprocessing**: Dual-pass grayscale conversion, Otsu threshold binarization, skew correction.
2. **Neural Optical Character Recognition**: Tesseract.js engine execution with character confidence matrices.
3. **Tailoring Shorthand Lexer & Tokenizer**: Parses unstructured measurement notes (e.g., `Ch 40 | W 34 | Sh 18.5 | Slv 25 | L 42`).
4. **Multi-Customer Ledger Segmentation**: Delimits entries across page lines, numbers, and horizontal borders.
5. **Uncertainty & Ambiguity Detection**: Flags low-confidence readings (e.g. `?`, smudged ink) for tailor verification.
6. **CRM Duplicate Resolution**: Exact phone matching, phone proximity, and Levenshtein name similarity scoring.

### 2.3 Order Lifecycle State Machine (11 Deterministic Stages)
Orders follow an immutable finite state machine preventing invalid backward transitions:
```
[ORDER_PLACED] ──> [ORDER_ACCEPTED] ──> [MEASUREMENT_CONFIRMED] ──> [FABRIC_RECEIVED]
                                                                            │
[QUALITY_CHECK] <── [STITCHING] <── [CUTTING] <─────────────────────────────┘
       │
       ├──> [READY] ──> [OUT_FOR_DELIVERY] ──> [COMPLETED]
       │
       └──> (Rework loop to [STITCHING] if QC flags defect)
```

### 2.4 Cryptographic Payments Engine
- Razorpay order creation with paise precision.
- Cryptographic HMAC-SHA256 signature verification on checkout completion.
- Webhook receiver with idempotent order state updates and balance calculation.

### 2.5 Scoped WebSocket Real-Time Infrastructure
- Dynamic room subscription (`shop:<tailor_id>`, `order:<order_id>`, `user:<user_id>`).
- 30-second ping/pong heartbeat with dead connection eviction.
- Instant delivery of status changes, new chat messages, and payment receipts.
