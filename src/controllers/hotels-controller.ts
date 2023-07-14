import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.listHotels(userId);
  res.status(httpStatus.OK).send(hotels);
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId: id } = req.params as Record<string, string>;

  try {
    const hotelId = parseInt(id);
    if (!hotelId || isNaN(hotelId) || hotelId <= 0) {
      throw { name: 'BadRequestError', message: 'Invalid Id' };
    }

    const hotel = await hotelsService.getHotelRooms(userId, hotelId);
    res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send({
        message: error.message,
      });
    }
    if (error.name === 'PaymentRequiredError') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send({
        message: error.message,
      });
    }
    res.status(httpStatus.BAD_REQUEST).send({
      message: error.message,
    });
  }
}
