# ResQ

## Commerce Continuity Engine for Failed Payments

ResQ is a payment recovery system built for the Razorpay AI Builder Internship 2026, AI Revenue Recovery track.

A failed payment should not automatically mean a lost purchase.

Instead of ending the checkout after one unsuccessful payment attempt, ResQ keeps the purchase alive for a controlled recovery window, allows the customer to retry, and updates the purchase only after Razorpay confirms the payment.

> Recover the purchase journey, not just the failed transaction.

---

## The Problem

A customer may still want to complete a purchase even when a payment fails because of a temporary banking issue, timeout, network problem, or unsuccessful payment attempt.

In a normal checkout flow, that single failure can interrupt the purchase and increase customer drop-off.

ResQ treats the purchase journey as the unit of recovery instead of treating every payment attempt as an isolated transaction.

---

## How ResQ Works

```text
Customer Checkout
        ↓
Order Created
        ↓
Razorpay Payment
        ↓
payment.failed
        ↓
RECOVERY_ACTIVE
        ↓
Recovery Window
        ↓
Customer Retries
        ↓
payment.captured
        ↓
PAID
        ↓
MongoDB + Merchant Dashboard Updated
```

If the first payment succeeds, the order moves directly from `PENDING` to `PAID`.

If it fails, the same order enters `RECOVERY_ACTIVE` instead of being immediately discarded. The customer gets a controlled period to retry the payment.

The final payment state is based on Razorpay events processed by the backend, not only on what the browser displays.

---

## Core Principles

- Payment truth comes from Razorpay
- Recovery is controlled by backend order state
- Duplicate payment events should not create duplicate updates
- Important recovery transitions remain traceable

---

## Key Features

- Razorpay Test Mode integration
- Failed-payment recovery flow
- Controlled recovery countdown
- Same-order payment retry
- Razorpay webhook processing
- HMAC webhook signature verification
- Duplicate webhook event protection
- MongoDB order persistence
- Recovery audit trail
- Merchant recovery dashboard
- Payment ID persistence
- Late-payment state support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Payments | Razorpay Test Mode, Payment Links, Webhooks |
| Webhook Testing | ngrok |
| Version Control | Git, GitHub |

---

## Architecture

```text
                       Customer
                          |
                          v
                 +-----------------+
                 | React + Vite    |
                 | Frontend        |
                 +--------+--------+
                          |
                       REST API
                          |
                          v
                 +-----------------+
                 | Node + Express  |
                 | Backend         |
                 +--------+--------+
                          |
                +---------+---------+
                |                   |
                v                   v
         +-------------+      +-------------+
         | MongoDB     |      | Razorpay    |
         | Atlas       |      | Test Mode   |
         +-------------+      +------+------+
                                     |
                                  Webhook
                                     |
                                     v
                              ResQ Backend
                                     |
                              Order State Update
```

---

## Order States

| Status | Meaning |
|---|---|
| `PENDING` | Order created and waiting for payment |
| `RECOVERY_ACTIVE` | Payment failed and recovery window is active |
| `DORMANT` | Active recovery has stopped |
| `PAID` | Razorpay confirmed the payment |
| `EXPIRED` | Recovery window ended without successful payment |
| `PAID_AFTER_TIMEOUT` | Payment was confirmed after the expected recovery window |

A failed payment is treated as a payment event, not as the permanent final state of the purchase.

---

## Webhook Reliability

Payment recovery cannot depend only on frontend state.

### Signature Verification

Incoming Razorpay webhook requests are verified using HMAC-SHA256 before their payment data is trusted.

### Duplicate Event Protection

Processed webhook events are stored in a `WebhookEvent` collection so repeated events do not update the same order multiple times.

### State Checks

The current order state is checked before applying important transitions.

```text
PENDING
   |
payment.failed
   |
   v
RECOVERY_ACTIVE
   |
payment.captured
   |
   v
PAID
```

This allows the backend and persisted database state to remain the source of truth for the recovery journey.

---

## Main Database Models

### Order

Stores:

- product information
- amount
- merchant
- order status
- recovery expiry
- stock reservation
- locked discount
- payment ID

### WebhookEvent

Stores processed Razorpay events for duplicate-event protection.

### AuditTrail

Records important events throughout the order lifecycle.

### MerchantConfig

Stores merchant-level recovery configuration and limits.

---

## Merchant Dashboard

The dashboard gives the merchant visibility into the current payment and recovery state.

It shows:

- orders
- paid orders
- active recoveries
- dormant orders
- order amounts
- payment status
- recovery activity

The dashboard reads order information from the backend and MongoDB.

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/orders/create` | Create an order |
| `GET` | `/api/orders` | Fetch orders |
| `GET` | `/api/orders/:id` | Fetch the latest state of an order |
| `POST` | `/api/orders/create-payment-link` | Create a Razorpay payment link |
| `POST` | `/api/webhooks` | Process Razorpay webhook events |

Important payment events handled:

```text
payment.failed
payment.captured
```

---

## Run Locally

### Clone

```bash
git clone https://github.com/abhinaybhuvanesh/ResQ.git
cd ResQ
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Start the backend:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5001
```

### Webhook Testing

```bash
ngrok http 5001
```

Configure the Razorpay webhook URL as:

```text
https://YOUR-NGROK-URL/api/webhooks
```

---

## Security

Sensitive credentials are stored using environment variables and excluded from Git using `.gitignore`.

The repository should never contain:

- MongoDB passwords
- Razorpay Key Secrets
- Razorpay Webhook Secrets
- `.env` files

Razorpay webhook signatures are verified before payment events are processed.

---

## Key Engineering Learning

The biggest learning while building ResQ was making the recovery flow depend on verified backend state instead of only what the frontend displayed.

The browser can refresh, close, lose connectivity, or temporarily display an outdated state. Razorpay payment events, backend validation, and persisted MongoDB state therefore act as the source of truth for the recovery journey.

---

## Next Step

The recovery engine can be extended with dynamic recovery windows, failure-specific payment strategies, merchant policies, and AI-assisted recovery recommendations.

---

## Built For

Razorpay AI Builder Internship 2026  
Track: AI Revenue Recovery

---

## Author

Abhinay Bhuvanesh Thota  
B.Tech Computer Science and Engineering  
KL University, Hyderabad

GitHub: https://github.com/abhinaybhuvanesh  
LinkedIn: https://linkedin.com/in/abhinaybhuvanesh

---

## Disclaimer

ResQ uses Razorpay Test Mode for development and demonstration.

No real payments are processed as part of the project demo.

---

ResQ — Keep the purchase alive.
