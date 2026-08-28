const mongoose = require('mongoose');

const merchantConfigSchema = new mongoose.Schema({
  merchantId: { type: String, required: true, unique: true },
  maxRecoveryCredit: { type: Number, default: 50 },
  maxCreditPercentage: { type: Number, default: 10 },
  marginSafeAmount: { type: Number, default: 100 },
  perishableWindowSeconds: { type: Number, default: 120 },
  physicalWindowMaxSeconds: { type: Number, default: 900 }
}, { timestamps: true });

module.exports = mongoose.model('MerchantConfig', merchantConfigSchema);