import { prisma } from '@/config';

async function findUserTicket(id: number) {
  return await prisma.ticket.findFirst({
    include: {
      TicketType: true,
    },
    where: {
      TicketType: {
        id,
      },
    },
  });
}

async function findAllTypes() {
  return prisma.ticketType.findMany();
}

const ticketRepository = {
  findUserTicket,
  findAllTypes,
};

export default ticketRepository;
