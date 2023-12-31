import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

export type BookingBody = { roomId: number };
export async function makeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as BookingBody;

  const booking = await bookingService.makeBooking(userId, roomId);
  res.status(httpStatus.OK).send(booking);
}

export async function modifyBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body as BookingBody;
  const { bookingId: paramId } = req.params as Record<string, string>;
  try {
    const bookingId = Number(paramId);
    if (!bookingId || isNaN(bookingId) || bookingId <= 0) {
      throw { name: 'BadRequestError', message: 'Invalid Id' };
    }

    const updateBooking = await bookingService.modifyBooking(userId, roomId, bookingId);
    res.status(httpStatus.OK).send(updateBooking);
  } catch (err) {
    if (err.name === 'BadRequestError') {
      return res.status(httpStatus.BAD_REQUEST).send({
        message: err.message,
      });
    }
    next(err);
  }
}
