# 🛡️ ResQ

### Commerce Continuity Engine for Failed Payments

ResQ is a payment recovery system built for the **Razorpay AI Builder Internship 2026 — AI Revenue Recovery track**.

A failed payment should not automatically mean a lost purchase.

Instead of ending the checkout after one unsuccessful payment attempt, ResQ keeps the purchase alive for a controlled recovery window, tracks the same order through the recovery journey, allows the customer to retry the payment, and only considers the purchase completed after Razorpay confirms the payment.

> **Recover the purchase journey, not just the failed transaction.**

---

## 📌 The Problem

A customer may genuinely want to complete a purchase but still face a payment failure because of banking issues, network problems, timeouts, or other temporary failures.

In a normal checkout flow, that single failure can interrupt the purchase and increase the chance of the customer dropping off.

ResQ treats the **purchase journey** as the unit of recovery instead of treating every payment attempt as a separate transaction.

---

## ⚙️ What ResQ Does

When a customer starts a purchase:

1. ResQ creates and tracks the order.
2. The customer continues to Razorpay Test Mode for payment.
3. Razorpay sends payment events to the ResQ backend through webhooks.
4. If the payment succeeds, the order moves to `PAID`.
5. If the payment fails, the same order moves to `RECOVERY_ACTIVE`.
6. A controlled recovery window begins.
7. The customer can retry the payment while the purchase remains active.
8. When Razorpay confirms the successful retry, the same order moves to `PAID`.
9. MongoDB stores the latest state and the merchant dashboard reflects the updated order.

The recovery flow depends on **verified backend payment events**, rather than only on what the frontend displays.

---

## 🔄 Recovery Flow

### Normal Successful Payment

```text
Customer Checkout
        ↓
Order Created
        ↓
Razorpay Payment
        ↓
payment.captured
        ↓
PAID
        ↓
MongoDB Updated
        ↓
Merchant Dashboard Updated
```

### Failed Payment → Recovery

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
Recovery Window Starts
        ↓
Customer Retries Payment
        ↓
payment.captured
        ↓
PAID
        ↓
Purchase Recovered
```

---

## 🧠 Core Principles

ResQ is designed around three main ideas:

- **Payment truth comes from Razorpay**
- **Recovery is controlled by backend order state**
- **Important recovery events remain traceable**

A frontend success or failure screen alone is not treated as the final payment truth.

---

## ✨ Features

- Razorpay Test Mode integration
- Failed-payment detection through webhooks
- Controlled recovery window
- Same-order payment retry
- `RECOVERY_ACTIVE` recovery state
- Razorpay webhook signature verification
- Duplicate webhook event protection
- MongoDB order persistence
- Payment ID storage
- Audit trail for important order events
- Merchant recovery dashboard
- Backend-driven payment state
- Late payment state support
- Responsive customer checkout flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Payments | Razorpay Test Mode, Payment Links, Webhooks |
| Webhook Testing | ngrok |
| Version Control | Git, GitHub |

---

## 🏗️ Architecture

```text
                    Customer
                       │
                       ▼
               ┌───────────────┐
               │ React + Vite  │
               │   Frontend    │
               └───────┬───────┘
                       │
                    REST API
                       │
                       ▼
               ┌───────────────┐
               │ Node.js +     │
               │ Express       │
               │ Backend       │
               └───────┬───────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
     ┌──────────────┐      ┌──────────────┐
     │ MongoDB      │      │ Razorpay     │
     │ Atlas        │      │ Test Mode    │
     └──────────────┘      └──────┬───────┘
                                  │
                               Webhook
                                  │
                                  ▼
                           ResQ Backend
                                  │
                           Order State Update
```

---

## 📦 Order States

| Status | Description |
|---|---|
| `PENDING` | Order created and waiting for payment |
| `RECOVERY_ACTIVE` | Payment failed and recovery window is active |
| `DORMANT` | Active recovery has stopped but the order can remain available for later handling |
| `PAID` | Razorpay confirmed the payment |
| `EXPIRED` | Recovery window ended without successful payment |
| `PAID_AFTER_TIMEOUT` | Payment was confirmed after the expected recovery window |

A failed payment is treated as a **payment event**, rather than permanently marking the complete order as failed.

---

## 🔐 Webhook Reliability

Payment recovery should not depend only on the browser.

ResQ processes Razorpay payment events on the backend and applies several checks before changing the order state.

### Signature Verification

Incoming Razorpay webhook requests are verified using HMAC-SHA256 before their payment data is trusted.

### Duplicate Event Protection

Processed events are stored in the `WebhookEvent` collection.

This prevents the same webhook event from repeatedly changing the order state.

### State Checks

The current order status is checked before important state transitions are applied.

This helps prevent repeated or delayed events from incorrectly changing the recovery journey.

---

## 🗄️ Database Models

### `Order`

Stores the purchase and recovery state, including:

- Product name
- Product description
- Amount
- Merchant
- Order status
- Reserved stock
- Locked discount
- Recovery expiry time
- Payment ID
- Recovery information

### `WebhookEvent`

Stores processed payment events and supports duplicate-event protection.

### `AuditTrail`

Records important events during the order and recovery lifecycle.

### `MerchantConfig`

Stores merchant-level recovery configuration and policy limits.

---

## 📊 Merchant Dashboard

The dashboard provides visibility into the current order and recovery states.

It displays information such as:

- Total revenue
- Paid orders
- Active recoveries
- Dormant orders
- Order status
- Order amount
- Recovery activity

Dashboard information is fetched from backend order data stored in MongoDB.

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/orders/create` | Create a new order |
| `GET` | `/api/orders` | Fetch orders for the merchant dashboard |
| `GET` | `/api/orders/:id` | Fetch the latest state of one order |
| `POST` | `/api/orders/create-payment-link` | Create a Razorpay Test Mode payment link |
| `POST` | `/api/webhooks` | Receive and process Razorpay webhook events |

Important Razorpay events handled by the recovery flow include:

```text
payment.failed
payment.captured
```

---

## 🧪 Testing the Recovery Flow

The complete recovery journey can be tested using Razorpay Test Mode.

1. Open the ResQ store.
2. Select a product.
3. Click **Buy Now**.
4. Continue to checkout.
5. Click **Pay Now**.
6. Complete a Razorpay Test Mode payment.

For the recovery flow:

1. Simulate a failed payment in Razorpay Test Mode.
2. Return to ResQ.
3. The same order moves to:

```text
RECOVERY_ACTIVE
```

4. A recovery countdown begins.
5. Continue the payment again.
6. Complete the retry successfully in Razorpay Test Mode.
7. Razorpay sends the successful payment event.
8. The same order moves to:

```text
PAID
```

9. The final state can be verified in:
   - ResQ checkout
   - Backend logs
   - MongoDB
   - Merchant dashboard

---

## 🚀 Local Setup

### Prerequisites

Make sure you have:

- Node.js
- npm
- MongoDB Atlas account
- Razorpay Test Mode account
- ngrok

---

### 1. Clone the Repository

```bash
git clone https://github.com/abhinaybhuvanesh/ResQ.git
cd ResQ
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

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

The backend runs on:

```text
http://localhost:5001
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

### 4. Start ngrok

Razorpay needs a public URL to send webhook events to your locally running backend.

```bash
ngrok http 5001
```

Copy the HTTPS forwarding URL generated by ngrok.

Configure the Razorpay webhook endpoint as:

```text
https://YOUR-NGROK-URL/api/webhooks
```

Use the same webhook secret in Razorpay and your backend `.env` file.

---

## 🔒 Security

Sensitive configuration is stored using environment variables.

The repository should never contain:

- MongoDB passwords
- Razorpay Key Secrets
- Razorpay Webhook Secrets
- `.env` files

The `.env` file is excluded from version control using `.gitignore`.

Razorpay webhook signatures are also verified before payment events are processed.

---

## 💡 Key Engineering Learning

The biggest learning while building ResQ was making payment recovery depend on **verified backend state instead of only what the frontend displayed**.

The browser can refresh, close, lose connectivity, or temporarily display an outdated state.

Because of that, Razorpay payment events, backend validation, and persisted MongoDB data act as the source of truth for the recovery journey.

---

## 📍 Current Scope

ResQ is currently a working prototype using **Razorpay Test Mode**.

The current version demonstrates:

- Order creation
- Razorpay payment initiation
- Payment failure detection
- Recovery activation
- Recovery countdown
- Payment retry
- Webhook processing
- MongoDB persistence
- Successful recovery
- Merchant dashboard visibility

Future versions can extend the recovery engine with:

- Failure-specific recovery strategies
- Dynamic recovery windows
- Merchant-defined recovery policies
- Payment-method recommendations
- Customer consent-based dormant recovery
- AI-assisted recovery decisions and explanations

---

## 🎯 Built For

**Razorpay AI Builder Internship 2026**  
**Track: AI Revenue Recovery**

---

## 👨‍💻 Author

**Abhinay Bhuvanesh Thota**

B.Tech Computer Science & Engineering  
KL University, Hyderabad

GitHub: [abhinaybhuvanesh](https://github.com/abhinaybhuvanesh)

LinkedIn: [abhinaybhuvanesh](https://linkedin.com/in/abhinaybhuvanesh)

---

## ⚠️ Disclaimer

ResQ uses **Razorpay Test Mode** for development and demonstration.

No real payments are processed as part of the project demo.

---

### 🛡️ ResQ — Keep the purchase alive.
