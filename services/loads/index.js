import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import loadRoutes from './routes/loadRoutes.js';

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Load service is running' });
});

app.use('/api/loads', loadRoutes);

app.listen(PORT, () => {
  console.log(`Load service running on port ${PORT}`);
});