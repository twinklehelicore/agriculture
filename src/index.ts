import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma';
import authRoutes from './routes/authRoute';
import adminRoutes from './routes/adminRoute';
import farmerRoutes from './routes/farmerRoute';
import providerRoutes from './routes/providerRoute';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors({ origin: [
  "http://localhost:5173",
  "https://https://qknt4gk5-5173.inc1.devtunnels.ms"
] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/farmer', farmerRoutes);
app.use('/provider', providerRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ status: 'ok', message: 'Server & DB connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database not connected' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Agriculture Service API', status: 'online' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});