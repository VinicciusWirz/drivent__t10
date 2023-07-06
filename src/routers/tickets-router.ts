import { Router } from 'express';
import { getTicketTypes, getUserTicket } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/', getUserTicket).get('/types', getTicketTypes);

export { ticketsRouter };
