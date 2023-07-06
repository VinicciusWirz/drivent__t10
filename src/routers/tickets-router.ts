import { Router } from 'express';
import { createTicket, getTicketTypes, getUserTicket } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/', getUserTicket)
  .post('/', createTicket)
  .get('/types', getTicketTypes);

export { ticketsRouter };
