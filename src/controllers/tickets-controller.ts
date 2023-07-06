import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';

interface authenticatedUser extends Request {
  userId: number;
}
export async function getUserTicket(req: authenticatedUser, res: Response) {
  const userId = req.userId;
  const ticketList = await ticketsService.getUserTicket(userId);
  res.send(ticketList);
}

export async function getTicketTypes(req: Request, res: Response) {
  const ticketList = await ticketsService.getTicketTypes();
  res.send(ticketList);
}

export type CreateTicketParams = { ticketTypeId: number };
export async function createTicket(req: authenticatedUser, res: Response) {
  const userId = req.userId;
  try {
    const { ticketTypeId } = req.body as CreateTicketParams;
    if (!ticketTypeId) throw { name: 'NoTicket', message: 'No ticket was selected' };

    const createdTicket = await ticketsService.createTicket(userId, ticketTypeId);

    res.status(httpStatus.CREATED).send(createdTicket);
  } catch (error) {
    if (error.name === 'NoTicket') return res.sendStatus(httpStatus.BAD_REQUEST);
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
