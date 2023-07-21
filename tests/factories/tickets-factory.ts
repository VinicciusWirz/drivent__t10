import faker from '@faker-js/faker';
import { Enrollment, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { generateCPF } from '@brazilian-utils/brazilian-utils';
import { prisma } from '@/config';

export async function createTicketType() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createTicketTypeSpecific(remote: boolean, hotel: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: remote,
      includesHotel: hotel,
    },
  });
}

export function buildFullTicket(
  ticketStatus: TicketStatus,
  isRemote: boolean,
  includesHotel: boolean,
): Ticket & { Enrollment: Enrollment; TicketType: TicketType } {
  return {
    id: faker.datatype.number(),
    enrollmentId: faker.datatype.number(),
    status: ticketStatus,
    ticketTypeId: faker.datatype.number(),
    Enrollment: {
      id: faker.datatype.number(),
      name: faker.name.findName(),
      cpf: generateCPF(),
      birthday: faker.date.past(),
      phone: faker.phone.phoneNumber('(##) 9####-####'),
      userId: faker.datatype.number(),
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    TicketType: {
      id: faker.datatype.number(),
      includesHotel,
      isRemote,
      name: faker.commerce.productName(),
      price: faker.datatype.number(),
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    updatedAt: new Date(),
    createdAt: new Date(),
  };
}
