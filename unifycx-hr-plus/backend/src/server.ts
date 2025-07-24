
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './api/auth/auth.routes';
import employeeRoutes from './api/employees/employee.routes';
import { errorHandler } from './middlewares/errorHandler';
import { protect } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'OptiTalent HRMS API is running.' });
});

app.use('/api/v1/auth', authRoutes);

// Protected Routes
app.use('/api/v1/employees', protect, employeeRoutes);
// Add other protected routes here

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
