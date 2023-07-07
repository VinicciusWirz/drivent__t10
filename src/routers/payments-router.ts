import { Router } from 'express';
import { getPaymentInfo, makePayment } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { paymentServiceSchema } from '@/schemas/payments-schema';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', getPaymentInfo)
  .post('/process', validateBody(paymentServiceSchema), makePayment);

export { paymentsRouter };
