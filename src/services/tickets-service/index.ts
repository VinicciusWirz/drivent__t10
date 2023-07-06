import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError } from '@/errors';

export async function getUserTicket(userId: number) {
  const userTicket = await ticketRepository.findUserTicket(userId);
  if (!userTicket) throw notFoundError();

  return userTicket;
}

export async function getTicketTypes() {
  return await ticketRepository.findAllTypes();
}

const ticketsService = { getTicketTypes, getUserTicket };
export default ticketsService;
