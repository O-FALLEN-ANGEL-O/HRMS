
import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import v1Router from './routes/v1';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Set various security headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/v1', v1Router);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'UnifyCX HR+ API is running.' });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
