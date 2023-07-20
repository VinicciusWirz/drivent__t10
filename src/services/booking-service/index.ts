import { TicketStatus } from '@prisma/client';
import { forbiddenError, notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';
import roomsRepository from '@/repositories/rooms-repository';
import ticketRepository from '@/repositories/ticket-repository';

export async function getBooking(userId: number) {
  const booking = await bookingsRepository.getBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}

export async function makeBooking(userId: number, roomId: number) {
  const ticket = await ticketRepository.findUserTicketByUserId(userId);
  if (ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw forbiddenError();
  }
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

export async function modifyBooking(userId: number, roomId: number, bookingId: number) {
  const ticket = await ticketRepository.findUserTicketByUserId(userId);
  if (ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw forbiddenError();
  }

  const isBooked = await bookingsRepository.getBooking(userId);
  if (!isBooked || isBooked.id !== bookingId) {
    throw forbiddenError();
  }

  const room = await roomsRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }

  if (room.Booking.length === room.capacity) {
    throw forbiddenError('The room is fully booked and currently unavailable.');
  }

  const updateBooking = await bookingsRepository.modifyBooking(bookingId, roomId);
  return { bookingId: updateBooking.id };
}

const bookingService = { getBooking, makeBooking, modifyBooking };
export default bookingService;
