require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

// --- Simple Product Schema ---
const Product = mongoose.model('Product', new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customerName:  { type: String, required: true },
  quantity:      { type: Number, required: true }
}, { timestamps: true }));

// --- Routes ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/ready', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

app.get('/health/startup', (req, res) => {
  res.json({ status: 'started' });
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

app.post('/api/orders', async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

// --- Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});