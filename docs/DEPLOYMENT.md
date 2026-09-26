# 🚀 TAILORHUB — PRODUCTION DEPLOYMENT & DEVOPS RUNBOOK

**Target Infrastructures:**
- **Frontend:** Vercel / Cloudflare Pages (Edge CDN, SSL, Automatic Previews)
- **Backend:** Render / Railway / Fly.io / AWS ECS (Node.js 20 LTS runtime, WSS support)
- **Database:** Supabase Managed PostgreSQL / Neon / AWS RDS (Postgres 15+, Connection Pooling)
- **Object Storage:** Supabase Storage / AWS S3 / Cloudflare R2 (Notebook Scans & Portfolio Media)

---

## 🛠️ 1. Environment Variables Matrix

### Backend (`backend/.env`)
```bash
# Server Port & Mode
PORT=5000
NODE_ENV=production

# Security & Authentication
JWT_SECRET=super_secret_jwt_hmac_production_key_2026_xyz
CORS_ORIGIN=https://frontend-eight-orcin-49.vercel.app

# Database (Supabase / Managed PostgreSQL)
DATABASE_URL=postgres://postgres.xxxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgres://postgres.xxxxx:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Object Storage (Supabase Storage / S3)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Style Engine (Google Gemini 1.5 Pro / Flash)
GEMINI_API_KEY=AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx

# Razorpay Payments Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

### Frontend (`frontend/.env.production`)
```bash
# Production Backend API URL
VITE_API_URL=https://tailorhub-api.onrender.com

# Production WebSocket URL
VITE_WS_URL=wss://tailorhub-api.onrender.com/ws

# Public Payment Gateway Key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
```

---

## 📦 2. Production Build & Deployment Steps

### 2.1 Backend Deployment (e.g. Render / Railway)
1. Set Root Directory to `backend/`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start` (executes `node dist/server.js`)
4. Health Check Path: `/health` (Expected response: HTTP 200 `{ "status": "ok" }`)

### 2.2 Frontend Deployment (Vercel)
1. Set Root Directory to `frontend/`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`
4. Output Directory: `dist`.
5. Rewrites configuration in `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🛡️ 3. Post-Deployment Verification Checklist

- [x] Backend `/health` returns `HTTP 200 OK` with status `ok`.
- [x] Database migration executes cleanly (`npm run seed` or `npm run db:deploy`).
- [x] WebSocket handshake succeeds on `/ws` with ping/pong heartbeat.
- [x] Real Tesseract OCR recognizes test image and extracts measurement tokens.
- [x] AI Style Assistant returns structured JSON recommendation with Zod validation.
- [x] Razorpay Order Creation returns valid order ID with HMAC validation enabled.
- [x] Helmet security headers present on all HTTP responses.
- [x] Rate limiter throttles excessive requests beyond thresholds.
