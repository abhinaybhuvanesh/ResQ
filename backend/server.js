const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI, {
  dbName: "resq"
})
  .then(() => console.log('✅ ResQ: MongoDB Connected'))
  .catch((err) => console.error('❌ ResQ: MongoDB Error:', err.message));

app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

const orderRoutes = require('./routes/orderRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/', (req, res) => {
  res.send('🚀 ResQ Backend is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 ResQ Server running on http://localhost:${PORT}`);
});