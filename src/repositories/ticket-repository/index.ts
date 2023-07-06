import { prisma } from '@/config';

async function findUserTicket(id: number) {
  return await prisma.ticket.findFirst({
    include: {
      TicketType: true,
    },
    where: {
      enrollmentId: id,
    },
  });
}

async function findAllTypes() {
  return await prisma.ticketType.findMany();
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return await prisma.ticket.create({
    data: { enrollmentId, ticketTypeId, status: 'RESERVED' },
    include: { TicketType: true },
  });
}

const ticketRepository = {
  findUserTicket,
  findAllTypes,
  createTicket,
};

export default ticketRepository;
