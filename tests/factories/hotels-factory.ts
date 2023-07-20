import faker from '@faker-js/faker';
import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function createHotel(): Promise<Hotel & { Rooms: Room[] }> {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.dataUri(),
    },
    include: { Rooms: true },
  });
}

export async function createRoom(hotelId: number, capacity: number = undefined): Promise<Room> {
  return await prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: capacity || faker.datatype.number(),
      hotelId,
    },
  });
}
