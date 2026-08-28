const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  productName: { type: String, required: true },
  productDescription: { type: String, default: '' },
  stockReserved: { type: Number, default: 1 },
  discountLocked: { type: Number, default: 0 },
  recoveryCreditOffered: { type: Number, default: 0 },
  recoveryExpiresAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['PENDING', 'RECOVERY_ACTIVE', 'DORMANT', 'PAID', 'EXPIRED', 'PAID_AFTER_TIMEOUT'],
    default: 'PENDING'
  },
  paymentId: { type: String, default: null },
  merchantId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);