import express, { type Application, type Request, type Response } from 'express';
import authRoutes from './routes/auth.route.js';

const app: Application = express();

app.use(express.json());
app.use(express.text());

app.use('/api', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Justify API is running');
});

export default app;
