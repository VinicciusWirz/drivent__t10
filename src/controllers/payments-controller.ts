import { Response } from 'express';
import httpStatus from 'http-status';
import { authenticatedUser } from '@/controllers/tickets-controller';
import paymentsService from '@/services/payments-service';
import { PaymentInfo } from '@/protocols';

export async function getPaymentInfo(req: authenticatedUser, res: Response) {
  const { ticketId } = req.query as Record<string, string>;
  const userId = req.userId;
  try {
    if (!ticketId) throw {};

    const ticketNumber = parseInt(ticketId);
    const paymentInfo = await paymentsService.getPaymentInfo(userId, ticketNumber);

    res.send(paymentInfo);
  } catch (error) {
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    if (error.name === 'UnauthorizedError') return res.status(httpStatus.UNAUTHORIZED).send(error.message);
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function makePayment(req: authenticatedUser, res: Response) {
  const body = req.body as PaymentInfo;
  const userId = req.userId;
  const payment = await paymentsService.makePayment(body, userId);
  res.send(payment).status(httpStatus.OK);
}
