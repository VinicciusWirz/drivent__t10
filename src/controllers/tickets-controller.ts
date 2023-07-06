import { Request, Response } from 'express';
import ticketsService from '@/services/tickets-service';

export async function getTicketTypes(req: Request, res: Response) {
  const ticketList = await ticketsService.getTicketTypes();
  res.send(ticketList);
}
