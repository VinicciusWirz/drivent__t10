import { prisma } from '@/config';
import { NewPayment } from '@/services';

async function findUserpayment(ticketId: number) {
  return await prisma.payment.findFirst({
    where: { ticketId },
    include: { Ticket: { include: { Enrollment: true } } },
  });
}

async function makePayment(body: NewPayment) {
  return await prisma.payment.create({
    data: { ...body },
  });
}

const paymentRepository = {
  findUserpayment,
  makePayment,
};

export default paymentRepository;
