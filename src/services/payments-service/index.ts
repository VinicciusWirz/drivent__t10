import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError, unauthorizedError } from '@/errors';
import paymentRepository from '@/repositories/payment-repository';

export async function getPaymentInfo(userId: number, ticketNumber: number) {
  const userTicket = await ticketRepository.findUserTicketById(ticketNumber);
  if (!userTicket) throw notFoundError();
  if (userTicket.Enrollment.userId !== userId) throw unauthorizedError();

  const userPayment = await paymentRepository.findUserpayment(ticketNumber);
  if (!userPayment) throw notFoundError();

  const { id, ticketId, value, cardIssuer, cardLastDigits, createdAt, updatedAt } = userPayment;
  return {
    id,
    ticketId,
    value,
    cardIssuer,
    cardLastDigits,
    createdAt,
    updatedAt,
  };
}

const paymentsService = { getPaymentInfo };
export default paymentsService;
