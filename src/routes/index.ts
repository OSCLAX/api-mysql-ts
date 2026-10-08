import { Router } from 'express';
import productsRoutes from './products.routes';

const router = Router();

// Prefijo requerido por la práctica
router.use('/api/v1/products', productsRoutes);

export default router;