import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.js';
import { producer } from './config/kafka.js';

const app = express();
const PORT = process.env.PORT || 3005;

producer.connect()
  .then(() => console.log('Kafka producer connected'))
  .catch(err => console.error('Kafka error:', err.message));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());


app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'Document service is running' });
});

app.use('/api/documents', documentRoutes);

app.listen(PORT, () => {
  console.log(`Document service running on port ${PORT}`);
});