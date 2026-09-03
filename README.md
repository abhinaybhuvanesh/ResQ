# ResQ

### Commerce Continuity Engine for Failed Payments

ResQ is a payment recovery system built for the **Razorpay AI Builder Internship 2026 — AI Revenue Recovery track**.

A failed payment should not automatically mean a lost purchase.

ResQ keeps the purchase alive for a controlled recovery window, tracks the order throughout the payment journey, allows the customer to retry the payment, and only treats the purchase as recovered after Razorpay confirms the successful payment.

---

## The Problem

Payment failures happen for many reasons: temporary banking issues, timeouts, network problems, or an unsuccessful payment attempt.

In a normal checkout flow, one failed payment can interrupt the entire purchase and increase the chance of customer drop-off.

The customer may still want the product, but the merchant can lose the order simply because the first payment attempt did not succeed.

ResQ treats the **purchase journey** as the unit of recovery instead of treating every payment attempt as an isolated transaction.

---

## What ResQ Does

When a customer starts a purchase:

1. ResQ creates and tracks the order.
2. The customer is redirected to Razorpay Test Mode for payment.
3. Razorpay sends payment events to the ResQ backend through webhooks.
4. If the payment succeeds, the order becomes `PAID`.
5. If the payment fails, the same order moves to `RECOVERY_ACTIVE`.
6. A controlled recovery window starts.
7. The customer can retry the payment without creating a completely new purchase journey.
8. Once Razorpay confirms the successful retry, the same order is updated to `PAID`.
9. The merchant dashboard reflects the updated order and payment state.

The recovery depends on verified backend payment events rather than only on what the frontend displays.

---

## Core Idea

> Recover the purchase journey, not just the failed transaction.

ResQ keeps the order state alive during recovery so that a temporary payment failure does not immediately destroy purchase intent.

The system is designed around three principles:

- **Payment truth comes from Razorpay**
- **Recovery is bounded and state-driven**
- **Every important transition is traceable**

---

## Demo Flow

### Successful Payment

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
MongoDB + Merchant Dashboard Updated
