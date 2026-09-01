const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const WebhookEvent = require('../models/WebhookEvent');
const AuditTrail = require('../models/AuditTrail');

router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = req.body.toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error(' Invalid webhook signature');
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    if (!payload || !payload.payment || !payload.payment.entity) {
      return res.status(200).send('Ignored non-payment event');
    }

    const paymentEntity = payload.payment.entity;
    const paymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const eventId = `${paymentId}_${eventType}`;

    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent) {
      console.log(`⏭️ Duplicate webhook ignored: ${eventId}`);
      return res.status(200).send('Duplicate ignored');
    }

    let order = await Order.findOne({ paymentId: razorpayOrderId });
    const mongoOrderId = paymentEntity.notes?.order_id || paymentEntity.order_id;

    if (mongoOrderId && mongoOrderId.length === 24) {
      order = await Order.findById(mongoOrderId);
    }

    if (!order) {
      console.error(` Order not found for Razorpay order: ${razorpayOrderId}`);
      return res.status(404).send('Order not found');
    }

    await WebhookEvent.create({
      eventId,
      eventType,
      orderId: order._id,
      paymentId,
      processed: false
    });

    if (eventType === 'payment.captured') {
      if (order.status === 'PAID' || order.status === 'PAID_AFTER_TIMEOUT') {
        return res.status(200).send('Already paid');
      }

      if (order.status === 'EXPIRED' || order.status === 'DORMANT') {
        order.status = 'PAID_AFTER_TIMEOUT';
      } else {
        order.status = 'PAID';
      }

      order.paymentId = paymentId;
      await order.save();

      await AuditTrail.create({
        orderId: order._id,
        eventType: 'PAID',
        metadata: { paymentId, status: order.status }
      });

      console.log(` Order ${order._id} marked as ${order.status}`);
    } else if (eventType === 'payment.failed') {
      if (order.status === 'PENDING' || order.status === 'RECOVERY_ACTIVE') {
        const recoveryWindowMs = 10 * 60 * 1000;
        const recoveryExpiresAt = new Date(Date.now() + recoveryWindowMs);

        order.status = 'RECOVERY_ACTIVE';
        order.recoveryExpiresAt = recoveryExpiresAt;
        await order.save();

        await AuditTrail.create({
          orderId: order._id,
          eventType: 'FAILED',
          metadata: {
            error: paymentEntity.error_description || 'Unknown error',
            recoveryExpiresAt
          }
        });

        console.log(`🔄 Order ${order._id} entered RECOVERY_ACTIVE. Timer ends at ${recoveryExpiresAt}`);
      }
    }

    await WebhookEvent.findOneAndUpdate({ eventId }, { processed: true });
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error(' Webhook Error:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;