import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError, PaymentRequiredError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';

export async function listHotels(userId: number) {
  const userTicket = await ticketRepository.findUserTicketByUserId(userId);
  if (!userTicket) throw notFoundError();
  if (userTicket.status !== 'PAID' || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
    throw PaymentRequiredError();
  }
  return await hotelsRepository.listHotels();
}

export async function getHotelRooms(userId: number, hotelId: number) {
  const userTicket = await ticketRepository.findUserTicketByUserId(userId);
  if (!userTicket) throw notFoundError();
  if (userTicket.status !== 'PAID' || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
    throw PaymentRequiredError();
  }
  const hotel = await hotelsRepository.getHotelRooms(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}

const hotelsService = { listHotels, getHotelRooms };
export default hotelsService;
