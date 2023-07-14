import { Router } from 'express';
import { getHotelRooms, listHotels } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', listHotels).get('/:hotelId', getHotelRooms);

export { hotelsRouter };
