const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const AuditTrail = require('../models/AuditTrail');
const MerchantConfig = require('../models/MerchantConfig');

router.post('/create', async (req, res) => {
  try {
    const { amount, productName, productDescription, merchantId } = req.body;
    if (!amount || !productName || !merchantId) {
      return res.status(400).json({ error: 'Missing required fields: amount, productName, merchantId' });
    }
    let config = await MerchantConfig.findOne({ merchantId });
    if (!config) config = await MerchantConfig.create({ merchantId });

    const recoveryWindowMs = 10 * 60 * 1000;
    const recoveryExpiresAt = new Date(Date.now() + recoveryWindowMs);

    const order = await Order.create({
      amount,
      productName,
      productDescription: productDescription || '',
      stockReserved: 1,
      discountLocked: 0,
      recoveryCreditOffered: 0,
      recoveryExpiresAt,
      status: 'PENDING',
      merchantId
    });

    await AuditTrail.create({
      orderId: order._id,
      eventType: 'ORDER_CREATED',
      metadata: { amount, productName }
    });

    res.status(201).json({
      success: true,
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create-payment-link', async (req, res) => {
  try {
    const { orderId, amount, productName } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const paymentLink = await instance.paymentLink.create({
      amount: amount * 100,
      currency: 'INR',
      accept_partial: false,
      description: productName,
      customer: { name: 'Abhinay', email: 'a@b.com' },
      notify: { sms: false, email: false },
      notes: { order_id: orderId },
    });

    res.json({ short_url: paymentLink.short_url });
  } catch (error) {
    console.error('Payment Link Error:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

module.exports = router;