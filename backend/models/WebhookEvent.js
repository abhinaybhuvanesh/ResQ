const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  paymentId: { type: String },
  processed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);