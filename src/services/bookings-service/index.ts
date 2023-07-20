import { forbiddenError, notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';
import roomsRepository from '@/repositories/rooms-repository';

export async function getBooking(userId: number) {
  const booking = await bookingsRepository.getBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}

export async function makeBooking(userId: number, roomId: number) {
  const room = await roomsRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  if (room.Booking.length === room.capacity) {
    throw forbiddenError('The room is fully booked and currently unavailable.');
  }
  const isBooked = await bookingsRepository.getBooking(userId);
  if (isBooked) {
    throw forbiddenError();
  }
  const booking = await bookingsRepository.makeBooking(userId, roomId);
  return { bookingId: booking.id };
}

export async function modifyBooking(userId: number) {
  return true;
}

const bookingsService = { getBooking, makeBooking, modifyBooking };
export default bookingsService;
