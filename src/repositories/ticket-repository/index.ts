import { prisma } from '@/config';

async function findAllTypes() {
  return prisma.ticketType.findMany();
}

const ticketRepository = {
  findAllTypes,
};

export default ticketRepository;
