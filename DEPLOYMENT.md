# 🚀 TailorHub Production Cloud Deployment Guide

This guide details the complete production deployment pipeline for **TailorHub**:

```
TailorHub Full-Stack App
          ↓
[Frontend]  → Vercel / Netlify
          ↓
[Backend]   → Render / Railway / Google Cloud Run
          ↓
[Database]  → PostgreSQL / Supabase
          ↓
[Storage]   → Supabase Storage / AWS S3 / Cloudinary
```

---

## 🗄️ Step 1: Database Setup (Supabase / PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create a free project (e.g. `tailorhub-prod`).
2. In the Supabase Dashboard, click on **SQL Editor** → **New Query**.
3. Copy the contents of [`backend/src/config/initPostgres.sql`](./backend/src/config/initPostgres.sql) and paste it into the editor.
4. Click **Run** to generate all 14 production tables and performance indexes.
5. Go to **Project Settings** → **Database** → **Connection String** (URI mode) and copy your `DATABASE_URL`:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

---

## 📦 Step 2: Cloud Storage Setup (Supabase Storage)

1. In your Supabase Dashboard, go to **Storage** → **New Bucket**.
2. Name the bucket: `tailorhub-records`.
3. Toggle **Public bucket** to `ON` (so customer measurement register scans are accessible).
4. Go to **Project Settings** → **API**:
   - Copy **Project URL** (`SUPABASE_URL`)
   - Copy **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

---

## ⚙️ Step 3: Backend Deployment (Render / Railway)

### Option A: Render (Recommended Free/Easy)
1. Push your repository to GitHub / GitLab.
2. Go to [render.com](https://render.com) and click **New +** → **Web Service**.
3. Select your repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_long_random_jwt_secret_here
   DATABASE_URL=postgresql://postgres.xxx:password@aws-0-xxx.supabase.com:6543/postgres
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
6. Click **Deploy Web Service**.
7. Once deployed, note your public API URL (e.g., `https://tailorhub-backend.onrender.com`).

### Option B: Railway / Cloud Run
- Deploy using the included [`backend/Dockerfile`](./backend/Dockerfile) or [`backend/railway.json`](./backend/railway.json).
- Healthcheck endpoint: `GET /health`

---

## 🌐 Step 4: Frontend Deployment (Vercel / Netlify)

### Option A: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_URL=https://tailorhub-backend.onrender.com
   VITE_WS_URL=wss://tailorhub-backend.onrender.com/ws
   ```
5. Click **Deploy**. Vercel will build and assign your production URL (e.g. `https://tailorhub.vercel.app`).
6. SPA routing is already configured via [`frontend/vercel.json`](./frontend/vercel.json).

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Set the environment variable `VITE_API_URL`.
6. SPA redirects are handled by [`frontend/netlify.toml`](./frontend/netlify.toml).

---

## 🔄 Step 5: Update Full Export Archive

A fresh complete export archive including all cloud configs is available at:
📁 `C:\Users\CHANDU\OneDrive\Desktop\TailorHub_Complete_App.zip`
