import express, { Application } from 'express';
import routes from './routes';

const app: Application = express();

// Middleware obligatorio para parsear JSON en el body
app.use(express.json());

// Montar las rutas
app.use(routes);

export default app;