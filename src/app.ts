import express, { type Application, type Request, type Response } from 'express';
import authRoutes from './routes/auth.route.js';
import justifyRoutes from './routes/justify.route.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app: Application = express();

app.use(express.json());
app.use(express.text());

app.use('/api', authRoutes);
app.use('/api', justifyRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Justify API is running');
});

// Error handling middleware must be registered LAST
// Order matters in Express:
// 1. Routes process requests
// 2. notFoundHandler catches undefined routes
// 3. errorHandler catches all thrown errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
