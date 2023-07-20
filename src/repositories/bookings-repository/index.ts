import { prisma } from '@/config';

async function getBooking(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}
async function makeBooking() {
  return true;
}
async function modifyBooking() {
  return true;
}

const bookingsRepository = { getBooking, makeBooking, modifyBooking };

export default bookingsRepository;
