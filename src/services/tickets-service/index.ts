import ticketRepository from '@/repositories/ticket-repository';
import { conflictError, notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';

export async function getUserTicket(userId: number) {
  const userEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!userEnrollment) throw notFoundError();

  const enrollmentId = userEnrollment.id;
  const userTicket = await ticketRepository.findUserTicket(enrollmentId);
  if (!userTicket) throw notFoundError();

  return userTicket;
}

export async function getTicketTypes() {
  return await ticketRepository.findAllTypes();
}

export async function createTicket(userId: number, ticketTypeId: number) {
  const userhasTicket = await ticketRepository.findUserTicket(userId);
  if (userhasTicket) throw conflictError('User already have a ticket');

  const userEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!userEnrollment) throw notFoundError();
  const enrollmentId = userEnrollment.id;

  return await ticketRepository.createTicket(enrollmentId, ticketTypeId);
}

const ticketsService = { getTicketTypes, getUserTicket, createTicket };
export default ticketsService;
