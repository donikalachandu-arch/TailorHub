# 💳 TAILORHUB — RAZORPAY PAYMENTS & TRANSACTION RECONCILIATION

**Module:** `backend/src/services/paymentService.ts` & `frontend/src/components/PaymentModal.tsx`  
**Payment Gateway:** Razorpay Node.js SDK (INR Currency, UPI, Cards, NetBanking)  
**Security Standard:** HMAC-SHA256 Cryptographic Signature Verification

---

## 🔄 1. Complete Payment Transaction Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as TailorHub Client
    participant Backend as Express Backend API
    participant DB as PostgreSQL Database
    participant RZP as Razorpay Gateway Servers

    Customer->>Frontend: Clicks "Pay Advance / Balance"
    Frontend->>Backend: POST /payments/create-order { order_id, amount }
    Backend->>RZP: orders.create({ amount: paise, currency: "INR" })
    RZP-->>Backend: Return { id: "order_xyz", amount: 50000 }
    Backend-->>Frontend: Return { razorpay_order_id, key_id, amount }
    Frontend->>Customer: Opens Razorpay Checkout Modal (UPI / QR / Card)
    Customer->>RZP: Completes payment authorization
    RZP-->>Frontend: Returns { razorpay_payment_id, razorpay_signature }
    Frontend->>Backend: POST /payments/verify-signature { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Note over Backend: Compute HMAC-SHA256(order_id + "|" + payment_id)
    Backend->>DB: BEGIN TRANSACTION<br/>1. Insert payments record<br/>2. Update order advance & balance<br/>3. Log order_status_history<br/>COMMIT
    Backend-->>Frontend: Return { message: "Payment verified", payment }
    Frontend->>Customer: Displays Official Payment Receipt
```

---

## 🔒 2. Cryptographic Signature Verification

To prevent client-side tampering, signatures are re-computed server-side using the private `RAZORPAY_KEY_SECRET`:

```typescript
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

if (generatedSignature !== razorpaySignature) {
  throw new Error('Invalid payment signature. Verification failed.');
}
```

---

## 🗃️ 3. Atomic Financial Reconciliation

Financial updates are wrapped in an ACID transaction:
1. **Insert Payment:** Writes immutable row to `payments` table.
2. **Recompute Balance:** Reads `total_amount`, adds new payment to `advance_amount`, recalculates `balance_amount = total_amount - advance_amount`.
3. **Audit Trail:** Records entry in `order_status_history` noting transaction ID and timestamp.
4. **WebSocket Push:** Broadcasts `PAYMENT_RECEIVED` to tailor studio in real time.
