// src/index.ts
import 'dotenv/config'; // Loads .env variables
import express from 'express';
import prisma from './lib/prisma';
import authRoutes from './routes/authRoute'; // your auth routes

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/auth', authRoutes); // Register, OTP, verify, admin login

// Simple health check (test DB connection)
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ status: 'ok', message: 'Server & DB connected' });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database not connected' });
  }
});

// Welcome page
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Agriculture Service API',
    status: 'online',
    endpoints: {
      auth: '/auth/register, /auth/send-otp, /auth/verify-otp, /auth/admin/login',
      health: '/health'
    }
  });
});

// 404 - route not found
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
  console.log('Try these:');
  console.log(`  → GET  http://localhost:${PORT}/health`);
  console.log(`  → POST http://localhost:${PORT}/auth/send-otp`);
  console.log(`  → POST http://localhost:${PORT}/auth/verify-otp`);
});

// Graceful shutdown (clean Prisma connection)
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