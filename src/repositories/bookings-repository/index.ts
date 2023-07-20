import { prisma } from '@/config';

async function getBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}
async function makeBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}
async function modifyBooking() {
  return true;
}

const bookingsRepository = { getBooking, makeBooking, modifyBooking };

export default bookingsRepository;
