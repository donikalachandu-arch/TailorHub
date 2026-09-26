# 🔍 TAILORHUB — PRODUCTION ARCHITECTURE & CODEBASE AUDIT

**Date:** September 26, 2026  
**Auditor:** Lead Architect, Security, DevOps & QA Engineering Team  
**System:** TailorHub Full-Stack SaaS Platform  
**Target Environments:** Production (Vercel + Render/Railway/Fly.io + Managed PostgreSQL + S3/R2/Supabase Storage + Redis)

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Existing Working Features](#3-existing-working-features)
4. [Simulated & Mocked Features](#4-simulated--mocked-features)
5. [Broken & Incomplete Features](#5-broken--incomplete-features)
6. [Security & Vulnerability Audit](#6-security--vulnerability-audit)
7. [Database & Data Integrity Issues](#7-database--data-integrity-issues)
8. [Scalability & Performance Bottlenecks](#8-scalability--performance-bottlenecks)
9. [Missing Production Services](#9-missing-production-services)
10. [Target Production Architecture](#10-target-production-architecture)
11. [Progressive Migration & Upgrade Plan](#11-progressive-migration--upgrade-plan)

---

## 1. Executive Summary

TailorHub has a functional UI prototype with basic CRUD operations, SQLite database, and frontend state management. However, for a real-world enterprise SaaS platform catering to individual customers, master tailors, multi-staff boutiques, and platform administrators, the codebase currently suffers from:
- **Simulated Core Services**: OCR (`lensOcrService.ts`) uses pattern-matching stubs rather than a true computer vision engine (Tesseract/Google Vision/Textract).
- **Simulated AI Engine**: AI Style recommendations are static hardcoded strings instead of live LLM inference with schema validation.
- **Simulated Payments**: Payment verification approves transactions without cryptographic HMAC signature validation with Razorpay.
- **Client-Side Mock Fallback**: `apiClient.ts` silently falls back to synthetic mock data on network error rather than reporting actual service state.
- **Database Architecture**: Development SQLite single-file database lacks connection pooling, row-level locking, migrations, and PostgreSQL native spatial indexing.
- **Authorization & Multi-Tenancy**: Lacks robust RBAC/ABAC isolation ensuring tailors access only their shop data and customers only access their personal profiles.

---

## 2. Current Architecture Analysis

### Frontend (`/frontend`)
- **Stack**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide Icons.
- **State & Contexts**: `AuthContext.tsx`, `LanguageContext.tsx` (en, te, hi), `VoiceContext.tsx`.
- **Strengths**: Clean component layout, responsive mobile navigation, interactive camera viewfinder with Canvas filters (binarization, deskew, zoom).
- **Flaws**:
  - `apiClient.ts` contained a client-side mock fallback engine intercepting failed HTTP calls.
  - Lack of centralized query caching (React Query / SWR).
  - Lack of form validation schemas (Zod).

### Backend (`/backend`)
- **Stack**: Node.js 20, Express 4.19, TypeScript, WebSocket (`ws`), `bcryptjs`, `jsonwebtoken`, `sqlite3`, `pg`.
- **Strengths**: REST endpoints structure, WebSocket connection management, SQLite database seeding.
- **Flaws**:
  - Single monolithic `api.ts` file (~1,250 lines) with tight coupling of routes, controllers, and business logic.
  - Inadequate input sanitization and parameter validation.
  - SQLite single-process lock limits concurrent requests.
  - WebSockets lack room-based channel authentication (`shop:id`, `order:id`).

---

## 3. Existing Working Features

| Feature | Implementation Status | Real Operation Verification |
| :--- | :--- | :--- |
| **User Authentication** | Working | Passwords hashed with bcrypt (10 rounds), JWT issued. |
| **Tailor Dashboard & Metrics** | Working | Calculates orders, revenue, and appointments from database. |
| **Customer Directory (CRM)** | Working | Reads and writes customer records and measurement vault items. |
| **Measurement Versioning** | Working | Inserts history records into `measurement_history` table on update. |
| **Order Status Workflow** | Working | Updates `orders` table and appends to `order_status_history`. |
| **Appointment Scheduling** | Working | Basic slot booking and status transition. |
| **Multilingual Translations** | Working | Complete i18n dictionaries for EN, TE, HI. |

---

## 4. Simulated & Mocked Features

| Feature | Current Simulation Pattern | Required Real Implementation |
| :--- | :--- | :--- |
| **TailorHub Lens OCR** | `BuiltInTailoringOCRProvider` returns static mock text based on substrings (`multi_customer`, `unclear`). | Real OCR Engine (Tesseract.js + Canvas preprocessor / Google Cloud Vision API) extracting raw text from uploaded image bytes. |
| **AI Style Assistant** | Returns static JSON templates from route code. | Real LLM API integration (Gemini 1.5 Pro/Flash or OpenAI) with Zod structured output validation. |
| **Payment Gateway** | Auto-returns `{ status: 'SUCCESS' }` without checking Razorpay HMAC signature. | Server-side Razorpay SDK order creation, webhook verification with `crypto.createHmac('sha256', secret)`. |
| **Client Mock Fallback** | `handleMockFallback()` in `apiClient.ts` serves fake data on server failure. | Strict error handling showing genuine service status and retry triggers. |

---

## 5. Broken & Incomplete Features

1. **Staff & Multi-Staff Permissions**: No tables or middleware for boutique staff roles (`STAFF`, `SHOP_MANAGER`).
2. **Double-Booking Prevention**: Appointment slots do not perform atomic conflict checks across simultaneous bookings.
3. **Invalid Order State Transitions**: Orders can transition backwards (e.g., `COMPLETED` -> `CUTTING`) without state-machine guards.
4. **File Storage**: Images are stored as raw base64 data URLs inside database text columns instead of Cloud Storage (S3 / R2 / Supabase Storage).

---

## 6. Security & Vulnerability Audit

- 🚨 **Secret Exposure Risk**: Default fallback secrets exist in code (`tailorhub_super_secret_jwt_key_2026_production`).
- 🚨 **Missing Rate Limiting**: No protection against brute-force login attempts or OCR endpoint abuse (`express-rate-limit`).
- 🚨 **Missing Security Headers**: No `helmet` or CSP configuration on Express.
- 🚨 **Insecure Payment Webhooks**: Webhook payloads are processed without verifying cryptographic signatures.
- 🚨 **Broken Object-Level Authorization (BOLA/IDOR)**:
  - Any authenticated user can read or modify another user's measurements if they know the measurement UUID.
  - Tailors can query customer profiles belonging to other shops.

---

## 7. Database & Data Integrity Issues

1. **SQLite Concurrency Bottleneck**: SQLite database file locks on concurrent writes, causing `SQLITE_BUSY` errors under production traffic.
2. **Missing Normalization**:
   - `shop_images` and `categories` stored as raw JSON text strings without relational integrity.
   - `measurement_data` stored as unvalidated JSON strings.
3. **Lack of Database Transactions**: Multi-step operations (e.g. creating order + reserving fabric + initial timeline event) execute as isolated statements without rollback capability.
4. **Missing Production Indexes**: Missing compound indexes on `(tailor_id, status)` and `(customer_id, created_at)`.

---

## 8. Scalability & Performance Bottlenecks

- **Base64 Bloat**: Storing 5MB photo uploads as Base64 strings in database rows multiplies database size by 1.37x and exhausts RAM during queries.
- **Unbounded Queries**: API routes return entire tables (`SELECT * FROM orders`) without pagination limits (`limit`, `offset`, cursor).
- **WebSocket Broadcast Inefficiency**: Events are broadcasted to all connected sockets rather than scoped to specific rooms (`shop:<tailor_id>`, `order:<order_id>`).

---

## 9. Missing Production Services

1. **Production OCR Engine**: Real optical character recognition on image buffers with image enhancement preprocessing.
2. **Real AI Recommendation Engine**: Live LLM invocation with strict JSON schema validation.
3. **Cloud Storage Engine**: AWS S3 / Cloudflare R2 / Supabase Storage with signed upload URLs.
4. **Payment Gateway**: Official Razorpay SDK integration with server-side webhook signature verification.
5. **Transactional SMS / WhatsApp / Email**: Real messaging notifications.

---

## 10. Target Production Architecture

```
                                  [ Users & Tailors ]
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
                 [ Mobile Browsers ]                 [ Desktop Browsers ]
                         │                                   │
                         └─────────────────┬─────────────────┘
                                           │ HTTPS / WSS
                                           ▼
                                [ Vercel Edge CDN ]
                             (React 18 + Vite + TypeScript)
                                           │
                                           ▼ REST / WebSockets
                         [ Production API Gateway / Render ]
                         (Express + Helmet + RateLimiter + Zod)
                                           │
       ┌──────────────────┬────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                ▼                  ▼                  ▼
[ Auth & RBAC ]    [ Order Engine ]  [ OCR Engine ]     [ AI Service ]     [ Razorpay ]
(JWT Access/Refresh)(State Machine)  (Tesseract/Vision) (Gemini LLM API)   (HMAC Webhook)
       │                  │                │                  │                  │
       └──────────────────┴────────────────┼──────────────────┴──────────────────┘
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
             [ Managed PostgreSQL DB ]           [ Cloud Storage (S3/R2) ]
             (UUID, Normalized, Transacted)      (Pre-signed URL uploads)
```

---

## 11. Progressive Migration & Upgrade Plan

| Phase | Objective | Scope & Key Deliverables |
| :---: | :--- | :--- |
| **Phase 1** | **Database & Schema Overhaul** | Implement unified PostgreSQL database layer, UUIDs, normalized tables, migrations, transactions, and indexing. |
| **Phase 2** | **Security & Authentication** | Implement enterprise RBAC (Customer, Tailor, Staff, Shop Manager, Admin), Rate Limiting, Helmet, strict IDOR authorization middleware. |
| **Phase 3** | **Real OCR Engine (TailorHub Lens)** | Replace simulated OCR with Tesseract.js / Vision engine, image preprocessing (contrast, binarization, deskew), and tokenized shorthand parser. |
| **Phase 4** | **Real AI Style Assistant** | Integrate Google Gemini / OpenAI LLM with Zod schema validation and structured outfit generation. |
| **Phase 5** | **Real Payments & Orders Lifecycle** | Implement official Razorpay SDK order creation & webhook HMAC verification; enforce 11-stage order state machine. |
| **Phase 6** | **Room-Based WebSockets & Chat** | Scoped WebSocket rooms (`shop:<id>`, `order:<id>`), real-time order tracking, and instant messaging. |
| **Phase 7** | **Clean API Client & Removal of Mocks**| Remove all mock fallbacks from frontend; implement real error boundaries and offline syncing status. |
| **Phase 8** | **Comprehensive Testing & CI/CD** | Expand automated unit, integration, and E2E test suites; verify production builds. |
| **Phase 9** | **Full Production Documentation** | Generate exhaustive architectural, API, database, security, and readiness documents. |
