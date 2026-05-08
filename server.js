import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SERVE FRONTEND STATIC FILES ---
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE CONNECTION ---
const DB_URI = process.env.DATABASE_URL || "mongodb+srv://thabethesandile44_db_user:e0iRpfSQY2P89zsy@cluster0.tp3uvcp.mongodb.net/systemsWorks?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URI)
  .then(() => console.log("● SYSTEMS_WORKS_CLOUD_DATABASE_ONLINE"))
  .catch(err => console.error("● DATABASE_CONNECTION_FAILED:", err.message));

// --- DATA BLUEPRINT (SCHEMA) ---
const DealSchema = new mongoose.Schema({
  companyName: { type: String, default: "General" }, // New: Support for multiple clients
  distance: Number,
  clientOffer: Number,
  tolls: Number,
  driverFee: Number,
  fuelPrice: Number,
  totalCost: Number,
  profit: Number,
  margin: Number,
  verdict: String,
  createdAt: { type: Date, default: Date.now }
});

const Deal = mongoose.model('Deal', DealSchema);

// --- API ENDPOINTS ---

/**
 * GET: Fetch history with optional company filtering
 * Usage: /api/deals OR /api/deals?company=ClientName
 */
app.get('/api/deals', async (req, res) => {
  try {
    const { company } = req.query;
    const filter = company ? { companyName: company } : {};

    const deals = await Deal.find(filter).sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

/**
 * GET: Single deal for the Share Page
 */
app.get('/api/deals/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: "System error retrieving deal" });
  }
});

/**
 * POST: Archive a new calculation
 */
app.post('/api/deals', async (req, res) => {
  try {
    const newDeal = new Deal(req.body);
    const savedDeal = await newDeal.save();
    res.status(201).json(savedDeal);
  } catch (error) {
    res.status(500).json({ error: "System failed to archive the deal" });
  }
});

/**
 * DELETE: Remove data from cloud
 */
app.delete('/api/deals/:id', async (req, res) => {
  try {
    const deletedDeal = await Deal.findByIdAndDelete(req.params.id);
    if (!deletedDeal) return res.status(404).json({ error: "Record already erased" });
    res.status(200).json({ message: "Cloud record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to erase record" });
  }
});

// --- SPA FALLBACK: Serve index.html for all non-API routes ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- START ENGINE ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`● SANDILE SYSTEMSWORKS LOGIC ENGINE`);
  console.log(`● STATUS: ACTIVE & MULTI-TENANT READY`);
  console.log(`● FRONTEND: SERVING FROM /dist`);
  console.log(`● PORT: ${PORT}`);
  console.log(`--------------------------------------------------`);
});