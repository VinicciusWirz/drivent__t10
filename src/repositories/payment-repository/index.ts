import { prisma } from '@/config';

async function findUserpayment(ticketId: number) {
  return await prisma.payment.findFirst({
    where: { ticketId },
    include: { Ticket: { include: { Enrollment: true } } },
  });
}

const paymentRepository = {
  findUserpayment,
};

export default paymentRepository;
