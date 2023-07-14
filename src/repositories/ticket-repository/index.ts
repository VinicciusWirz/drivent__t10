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

async function findUserTicketById(id: number) {
  return await prisma.ticket.findFirst({
    where: { id },
    include: { Enrollment: true, TicketType: true },
  });
}

async function findUserTicketByUserId(userId: number) {
  return await prisma.ticket.findFirst({
    where: { Enrollment: { userId } },
    include: { Enrollment: true, TicketType: true },
  });
}

async function updateTicketPayment(id: number) {
  return await prisma.ticket.update({
    data: { status: 'PAID' },
    where: { id },
  });
}

const ticketRepository = {
  findUserTicket,
  findAllTypes,
  createTicket,
  findUserTicketById,
  findUserTicketByUserId,
  updateTicketPayment,
};

export default ticketRepository;
