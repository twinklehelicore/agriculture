// src/index.ts
import 'dotenv/config';
import express from 'express';
import prisma from './lib/prisma';
import authRoutes from './routes/authRoute';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Health check (tests DB connection)
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ status: 'ok', message: 'Server & DB connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database not connected' });
  }
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Agriculture Service API',
    status: 'online',
    endpoints: {
      auth: '/auth/register, /auth/send-otp, /auth/verify-otp, /auth/admin-login',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Test these:');
  console.log(`  → GET  http://localhost:${PORT}/health`);
  console.log(`  → POST http://localhost:${PORT}/auth/register`);
  console.log(`  → POST http://localhost:${PORT}/auth/admin-login`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});