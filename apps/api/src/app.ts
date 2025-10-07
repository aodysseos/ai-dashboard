import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['CLIENT_URL'] || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes will be added here
app.get('/api', (_req, res) => {
  res.json({ message: 'AI Dashboard API is running!' });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
