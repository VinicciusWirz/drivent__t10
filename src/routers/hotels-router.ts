import { Router } from 'express';
import { listHotels } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', listHotels).get('/:hotelId', listHotels);

export { hotelsRouter };
