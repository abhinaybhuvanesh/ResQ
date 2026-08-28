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