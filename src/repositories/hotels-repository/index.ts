import { prisma } from '@/config';

async function listHotels() {
  const result = await prisma.hotel.findMany({ include: { Rooms: true } });
  return result;
}
async function getHotelRooms(hotelId: number) {
  const result = await prisma.hotel.findFirst({ where: { id: hotelId }, include: { Rooms: true } });
  return result;
}

const hotelsRepository = { listHotels, getHotelRooms };

export default hotelsRepository;
