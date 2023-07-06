import ticketRepository from '@/repositories/ticket-repository';

export async function getTicketTypes() {
  return await ticketRepository.findAllTypes();
}

const ticketsService = { getTicketTypes };
export default ticketsService;
