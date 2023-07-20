import { notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';

export async function getBooking(userId: number) {
  const booking = await bookingsRepository.getBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}

export async function makeBooking(userId: number) {
  return true;
}

export async function modifyBooking(userId: number) {
  return true;
}

const bookingsService = { getBooking, makeBooking, modifyBooking };
export default bookingsService;
