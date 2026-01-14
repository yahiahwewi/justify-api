import express, { Application, Request, Response } from 'express';
import authRoutes from './routes/auth.route.js';
import justifyRoutes from './routes/justify.route.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.static('public'));

// Enregistrement des routes
app.use('/api', authRoutes);
app.use('/api', justifyRoutes);

// Gestion des erreurs (doit être après les routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
