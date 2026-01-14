import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.use(express.json());
app.use(express.text());

app.get('/', (req: Request, res: Response) => {
    res.send('Justify API est opérationnelle');
});

export default app;
