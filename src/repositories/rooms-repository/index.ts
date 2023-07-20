import { prisma } from '@/config';

async function findRoomById(roomId: number) {
  return await prisma.room.findFirst({
    where: { id: roomId },
    include: { Booking: true },
  });
}

const roomsRepository = { findRoomById };

export default roomsRepository;
