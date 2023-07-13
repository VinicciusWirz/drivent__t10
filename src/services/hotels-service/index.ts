import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError, PaymentRequiredError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';

export async function listHotels(userId: number) {
  const userTicket = await ticketRepository.findUserTicketById(userId);
  if (!userTicket) throw notFoundError();
  if (userTicket.status !== 'PAID' || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
    throw PaymentRequiredError();
  }
  return await hotelsRepository.listHotels();
}

const hotelsService = { listHotels };
export default hotelsService;
