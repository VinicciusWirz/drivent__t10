import { Router } from 'express';
import { getBooking, makeBooking, modifyBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', makeBooking)
  .put('/:bookingId', modifyBooking);

export { bookingsRouter };
