# ✂️ TAILORHUB – Smart Digital Tailoring Platform & AI Lens

> **“Your Tailor. Your Style. Your Digital Wardrobe.”**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production%20App-brightgreen?logo=vercel&style=for-the-badge)](https://frontend-eight-orcin-49.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-Full--Stack-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#)

---

## 🌐 🚀 Live Production Links

- **🌍 Primary Vercel Cloud App**: **[https://frontend-eight-orcin-49.vercel.app](https://frontend-eight-orcin-49.vercel.app)**
- **⚡ Alternate Cloud Link**: [https://frontend-5hlwwyhts-govikarshivpooja5-3944s-projects.vercel.app](https://frontend-5hlwwyhts-govikarshivpooja5-3944s-projects.vercel.app)

---

## 🌟 Core Differentiators & Highlights

1. **Old Book Digitization (Handwritten Register Scan)**: Scan physical tailor register books using AI OCR + handwriting recognition engine with field confidence scoring (Green high, Yellow/Red review) and human verification editor to create digital customer records.
2. **Digital Measurement Vault**: Multi-profile storage for Shirts, Pants, Kurtas, Blouses & Suits with full version history tracking and optional AI Body Measurement estimation module.
3. **Customer–Tailor Marketplace**: Search tailors by name, shop, location, or service; filter by Men, Women, Kids, Alterations, Rating, and Starting Price; integrated with phone dialer and Google Maps directions.
4. **Appointment Booking System**: Service selection, date/time slot picker, real availability checking, and double-booking prevention.
5. **Multi-Step Order Wizard & 11-Stage Status Tracking**: 10-step wizard generating human-readable order IDs (`TH-2026-000123`), 11-stage visual progress timeline, real-time WebSocket live sync.
6. **Multilingual & Voice Support**: Complete UI localization in English, Telugu (తెలుగు), and Hindi (हिन्दी) with Web Speech Synthesis voice announcements.
7. **Tailor Business Ecosystem & Analytics**: Real database analytics for weekly/monthly revenue trends, order stage breakdowns, service popularity, repeat customers, and admin super-control panel.
8. **Razorpay Payment Gateway**: Backend transaction verification, advance/balance split, and receipt generation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)

### Installation

```bash
# Clone or navigate to the tailorhub directory
cd tailorhub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Local Development

```bash
# 1. Run Backend Server (Port 5000)
cd backend
npm run dev

# 2. Run Frontend Web App (Port 3000)
cd frontend
npm run dev
```

### Running Verification Tests

```bash
cd backend
npm test
```

---

## 📂 Project Architecture

```
/tailorhub
├── /backend
│   ├── /src
│   │   ├── /config (database.ts, seed.ts)
│   │   ├── /middleware (auth.ts - JWT & Role RBAC)
│   │   ├── /routes (api.ts - REST & WebSockets)
│   │   └── server.ts
│   ├── /test (api.test.ts)
│   ├── tailorhub.db (SQLite database)
│   └── package.json
├── /frontend
│   ├── /src
│   │   ├── /components (Splash, Onboarding, CustomerDashboard, TailorDiscovery, MeasurementVault, OrderWizard, OrderTracking, OldRecordScanner, AIStyleAssistant, PaymentModal, TailorAnalytics, AdminDashboard)
│   │   ├── /context (AuthContext, LanguageContext, VoiceContext)
│   │   ├── /locales (en.json, te.json, hi.json)
│   │   ├── /services (apiClient.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── /shared
│   └── types.ts
├── .env.example
└── README.md
```

---

## 🔐 Credentials & Quick Demo Logins

| Role | Email | Password | Description |
|---|---|---|---|
| **Tailor** | `ramesh@tailors.com` | `password123` | Master Tailor Ramesh (Banjara Hills) |
| **Customer** | `vikram@gmail.com` | `password123` | Vikram Reddy (Customer Wardrobe) |
| **Admin** | `admin@tailorhub.com` | `admin123` | Platform Super Admin |
