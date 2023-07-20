import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingsService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

export async function makeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  //TODO: finish service
  await bookingsService.makeBooking(userId);
  res.status(httpStatus.OK).send('placeholder');
}

export async function modifyBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  //TODO: finish service
  await bookingsService.modifyBooking(userId);
  res.status(httpStatus.OK).send('placeholder');
}
