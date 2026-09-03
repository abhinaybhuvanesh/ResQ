Project Name: ResQ
Tagline: Keep the purchase alive.

ResQ is an AI-powered commerce continuity engine that recovers revenue from failed payments. Instead of showing a dead "Payment Failed" screen, ResQ temporarily protects the order, stock, and price, intelligently diagnoses the failure, and guides the customer to a successful retry—all while providing a verifiable audit trail for merchants.

Built for the Razorpay AI Buildathon — "Code speaks louder than resumes."

The Problem It Solves:
When a UPI or card payment fails, customers abandon carts, merchants lose revenue, and support teams get flooded with queries. ResQ ensures that a failed transaction doesn't mean a lost sale.

Key Features:
- Commerce Continuity Window — Temporarily reserves stock and price when a payment fails.
- Dynamic Recovery Timer — Holds the order for 3–15 minutes based on inventory demand.
- 3-Way Failure Classification — Distinguishes Wrong PIN (retry UPI), Bank Outage (switch payment method), and Unknown errors.
- Self-Healing Checkout — Dynamically adapts the payment UI based on the real failure reason.
- Dormant Order Recovery — If the timer expires, the order goes dormant; if the payment route heals later, the customer gets a consent-based second chance.
- Verified Revenue Metrics — Only counts ₹ as "recovered" if Razorpay confirms payment.captured via webhook.
- Audit Trail — Full transaction history showing every state transition.
- Webhook Security — Signature verification and deduplication to prevent double processing.

Tech Stack:
Frontend: React.js, Vite, CSS
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Payments: Razorpay API (Test Mode)
State Management: React Hooks
Deployment: Render (Backend), Vercel (Frontend)

Architecture Flow:
Order Created → Stock/Price Reserved → Payment Attempt → Payment Fails → Truth Guard (Check if money actually left) → Classify Failure (Wrong PIN vs Bank Outage) → Incentive Check (Optional merchant-controlled recovery credit) → Dynamic Recovery Window (3-15 mins) → Success = PAID ✅ / Timeout = Release Stock → Dormant Order (24hrs) → Route becomes healthy → Customer Consent (Tap to Pay) → PAID ✅ → Audit Trail & Verified Revenue

How to Test the Recovery Flow:
1. Buy a product from the ResQ Store.
2. On the Razorpay checkout page, enter the wrong OTP (0000).
3. The payment will fail — and ResQ will automatically display the "Recovery Active" screen with a 10-minute timer.
4. Click "Continue payment", enter the correct OTP (1111), and the payment will succeed.
5. Check the Merchant Dashboard (/dashboard) — you will see the order transition to PAID and the Verified Recovered Revenue increase.

Test Card Details:
Card: 4100 2800 0000 1007
Expiry: 12/30
CVV: 123
OTP (Success): 1111
OTP (Failure): 0000

API Endpoints:
POST /api/orders/create — Create a new order
GET /api/orders/ — Fetch all orders (Dashboard)
GET /api/orders/:id — Fetch a single order (Polling)
POST /api/orders/create-payment-link — Generate Razorpay Payment Link
POST /api/webhooks/razorpay — Razorpay webhook handler (Signature verification + Dedupe)

Why This Matters:
Most systems try to retry a payment. ResQ recovers the purchase.
✅ For Customers: No more starting over. The purchase stays alive.
✅ For Merchants: Inventory is protected. Revenue is verified.
✅ For Developers: Clean state machine, secure webhooks, and a full audit trail.

GitHub: https://github.com/abhinaybhuvanesh/ResQ

Keep the purchase alive.
