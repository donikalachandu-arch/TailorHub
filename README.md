# ✂️ TAILORHUB – Smart Digital Tailoring Platform & AI Lens

> **“Your Tailor. Your Style. Your Digital Wardrobe.”**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production%20App-brightgreen?logo=vercel&style=for-the-badge)](https://frontend-eight-orcin-49.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-Full--Stack-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#)

---

## 📖 About TailorHub

**TailorHub** is an AI-powered smart digital platform engineered to bridge the gap between customers and local tailoring businesses while empowering master tailors, boutiques, and apparel MSMEs with a modern digital management operating system.

Experience the live production application here:  
👉 **[https://frontend-eight-orcin-49.vercel.app](https://frontend-eight-orcin-49.vercel.app)**

Traditional tailoring shops across India manage decades of invaluable customer measurements, order histories, and fitting preferences in physical handwritten paper registers and notebooks. **TailorHub** transforms this centuries-old manual workflow into a streamlined, searchable, cloud-connected digital ecosystem featuring **TailorHub Lens** — an intelligent OCR & tailoring shorthand digitization engine.

---

## 📝 Project Description

TailorHub provides two distinct, fully synchronized user portals built into a single progressive web application:

### 1. ✂️ For Master Tailors & Boutiques
- **TailorHub Lens (AI Record Digitization)**: Digitize decades of old handwritten tailoring registers using computer vision, binarization/deskew image filters, tailoring shorthand parsers (`Ch 40`, `W 34`, `Slv 25`, `Sh 18.5`), and multi-customer page segmentation.
- **Customer Directory & Measurement Vault**: Centralized customer records with versioned measurement history, digitized notebook scan archives, and one-click order generation.
- **Order Pipeline & Workflow Management**: Track garments through cutting, stitching, fitting, quality check, and ready stages with automated timeline logging.
- **Revenue Analytics & Business Intelligence**: Monitor weekly/monthly revenue trends, top stitching services, advance balance collections, and repeat customer ratios.

### 2. 🛍️ For Customers
- **Local Tailor Discovery**: Locate nearby verified master tailors and boutiques with distance filters, ratings, category tags, price benchmarks, and Google Maps navigation.
- **Digital Measurement Wardrobe**: Store reusable fitting profiles for shirts, pants, suits, kurtas, lehengas, and designer blouses with version tracking.
- **AI Style Assistant**: Intelligent design recommendations for necklines, sleeve cuts, collar styling, pattern pairings, and occasion-specific outfit ideas.
- **Live Order Tracking & Appointment Scheduler**: Real-time progress tracker from fabric delivery to final fitting pickup with multi-lingual audio announcements.

---

## 🌐 🚀 Live Production Links

- **🌍 Primary Vercel Cloud App**: **[https://frontend-eight-orcin-49.vercel.app](https://frontend-eight-orcin-49.vercel.app)**
- **⚡ Alternate Cloud Link**: [https://frontend-5hlwwyhts-govikarshivpooja5-3944s-projects.vercel.app](https://frontend-5hlwwyhts-govikarshivpooja5-3944s-projects.vercel.app)
- **💻 Local 1-Click Launcher**: Run `start-tailorhub.bat` on your local environment

---

## 🌟 Core Modules & Capabilities

1. **📸 TailorHub Lens (Handwritten Register Digitization)**:
   - Live camera viewfinder (`getUserMedia`) + gallery image uploader.
   - Contrast binarization, edge sharpening, and interactive deskew sliders.
   - Tokenized tailoring shorthand parser with multi-customer segment candidate cards.
   - Field-level confidence scores (🟢 $\ge 85\%$, 🟡 $60-84\%$, 🔴 $<60\%$).
   - Smart Duplicate Customer Resolution (`[UPDATE EXISTING]`, `[CREATE NEW]`, `[CANCEL]`).

2. **📏 Multi-Version Measurement Vault**:
   - Universal measurements data structure with upper and lower body metrics.
   - Measurement version history log preserving every past measurement modification.
   - Direct integration into custom stitching order creation.

3. **🧵 11-Stage Custom Order Pipeline**:
   - Statuses: `ORDER_PLACED` → `ORDER_ACCEPTED` → `MEASUREMENT_CONFIRMED` → `FABRIC_RECEIVED` → `CUTTING` → `STITCHING` → `QUALITY_CHECK` → `READY` → `OUT_FOR_DELIVERY` → `COMPLETED`.
   - Real-time WebSocket event synchronization.

4. **🗣️ Multilingual UI & Voice Notifications**:
   - English, Telugu (తెలుగు), and Hindi (हिन्दी) localization dictionaries.
   - Web Speech Synthesis for spoken status alerts in selected regional languages.

---

## 🔐 Demo Accounts & Test Credentials

| Role | Email | Password | Included Features |
| :--- | :--- | :--- | :--- |
| **Master Tailor** *(Default)* | `ramesh@tailors.com` | `password123` | **TailorHub Lens OCR**, Customer Vault, Measurement Versioning, Stitching Pipeline, Revenue Analytics |
| **Customer** | `vikram@gmail.com` | `password123` | Tailor Discovery, AI Style Assistant, Custom Order Wizard, Digital Measurements Vault |
| **Admin** | `admin@tailorhub.com` | `admin123` | Platform Analytics, Boutique Verification, System Health |

*(Use the **1-Click Role Switcher** buttons in the top navbar to instantly test any role!)*

---

## 📂 Project Architecture

```
/tailorhub
├── /backend
│   ├── /src
│   │   ├── /config (database.ts, seed.ts, initPostgres.sql)
│   │   ├── /middleware (auth.ts - JWT & Role RBAC)
│   │   ├── /routes (api.ts - REST & WebSockets)
│   │   ├── /services (lensOcrService.ts, storageService.ts)
│   │   └── server.ts
│   ├── /test (api.test.ts)
│   ├── Dockerfile & render.yaml
│   └── package.json
├── /frontend
│   ├── /src
│   │   ├── /components (OldRecordScanner, TailorCustomerManagement, TailorDashboard, CustomerDashboard, MeasurementVault, OrderWizard, OrderTracking, AIStyleAssistant, TailorAnalytics, AdminDashboard)
│   │   ├── /context (AuthContext, LanguageContext, VoiceContext)
│   │   ├── /locales (en.json, te.json, hi.json)
│   │   ├── /services (apiClient.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html & vercel.json
│   └── package.json
├── /shared
│   └── types.ts
├── DEPLOYMENT.md
├── push-to-github.bat
├── deploy-to-vercel.bat
├── start-tailorhub.bat
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)

### Installation & Run Locally

```bash
# 1. Start Backend Server (Port 5000)
cd backend
npm install
npm run dev

# 2. Start Frontend UI (Port 3000)
cd ../frontend
npm install
npm run dev
```

### Running Verification Tests

```bash
cd backend
npm test
```
