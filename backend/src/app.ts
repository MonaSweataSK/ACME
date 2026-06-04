import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import employeeRoutes from './routes/employee.routes';
import salaryRoutes from './routes/salary.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Core middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', salaryRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler — must come after all routes
app.use(notFound);

// Global error handler — must be last
app.use(errorHandler);

export default app;
