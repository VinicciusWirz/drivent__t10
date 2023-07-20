import { Router } from 'express';
import { getBooking, makeBooking, modifyBooking } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), makeBooking)
  .put('/:bookingId', validateBody(bookingSchema), modifyBooking);

export { bookingsRouter };
