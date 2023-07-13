import { prisma } from '@/config';

async function listHotels() {
  const result = await prisma.hotel.findMany();
  return result;
}

const hotelsRepository = { listHotels };

export default hotelsRepository;
