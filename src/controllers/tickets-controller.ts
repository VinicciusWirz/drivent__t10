import { Request, Response } from 'express';
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
