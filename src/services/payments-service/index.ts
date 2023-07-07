import { PaymentInfo } from '@/protocols';
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

export type NewPayment = {
  ticketId: number;
  value: number;
  cardIssuer: string;
  cardLastDigits: string;
};
export async function makePayment(input: PaymentInfo, userId: number) {
  const { ticketId, cardData } = input;
  const { issuer, number } = cardData;
  const ticket = await ticketRepository.findUserTicketById(ticketId);
  if (!ticket) throw notFoundError();
  if (ticket.Enrollment.userId !== userId) throw unauthorizedError();

  const cardLastDigits = number.toString().slice(-4);
  const paymentInfo: NewPayment = {
    ticketId,
    cardIssuer: issuer,
    cardLastDigits,
    value: ticket.TicketType.price,
  };

  const payment = await paymentRepository.makePayment(paymentInfo);

  await ticketRepository.updateTicketPayment(ticketId);

  return payment;
}

const paymentsService = { getPaymentInfo, makePayment };
export default paymentsService;
