import { faker } from '@faker-js/faker';
import { Booking, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function buildBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    include: {
      Room: true,
    },
  });
}

export function generateBooking(userId: number = undefined, capacity: number = undefined): Booking & { Room: Room } {
  return {
    id: faker.datatype.number({ min: 1, max: 2000000 }),
    roomId: faker.datatype.number({ min: 1, max: 2000000 }),
    Room: {
      id: faker.datatype.number({ min: 1, max: 2000000 }),
      name: faker.lorem.word(),
      capacity: capacity || faker.datatype.number({ min: 1, max: 2000000 }),
      hotelId: faker.datatype.number({ min: 1, max: 2000000 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    updatedAt: new Date(),
    createdAt: new Date(),
    userId: userId || faker.datatype.number({ min: 1, max: 2000000 }),
  };
}
