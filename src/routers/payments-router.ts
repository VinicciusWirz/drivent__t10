import { Router } from 'express';
import { getPaymentInfo } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter.all('/*', authenticateToken).get('/', getPaymentInfo);

export { paymentsRouter };
