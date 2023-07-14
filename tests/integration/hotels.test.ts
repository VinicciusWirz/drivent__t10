import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { Hotel, Room, TicketStatus } from '@prisma/client';
import { createEnrollmentWithAddress, createUser, createTicket, createTicketTypeSpecific } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel, createRoom } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have a ticket', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const isRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is for remote', async () => {
      const isRemote = true;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const isRemote = false;
      const includesHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and hotels data', async () => {
      const isRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel1 = await createHotel();

      const hotel2 = await createHotel();

      type HotelCompare = Pick<Hotel, 'id' | 'image' | 'name'> & {
        createdAt: string;
        updatedAt: string;
      };
      const hotel1Form: HotelCompare = {
        id: hotel1.id,
        image: hotel1.image,
        name: hotel1.name,
        createdAt: hotel1.createdAt.toISOString(),
        updatedAt: hotel1.updatedAt.toISOString(),
      };
      const hotel2Form: HotelCompare = {
        id: hotel2.id,
        image: hotel2.image,
        name: hotel2.name,
        createdAt: hotel2.createdAt.toISOString(),
        updatedAt: hotel2.updatedAt.toISOString(),
      };
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([hotel1Form, hotel2Form]);
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when receiving non valid hotel id number', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/randomString').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when receiving non valid hotel id number', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/-1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when user doesnt have a ticket', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const isRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is for remote', async () => {
      const isRemote = true;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const isRemote = false;
      const includesHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and hotel rooms', async () => {
      const isRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeSpecific(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room1 = await createRoom(hotel.id);

      type HotelCompare = Pick<Hotel, 'id' | 'image' | 'name'> & {
        createdAt: string;
        updatedAt: string;
      };
      type RoomCompare = Pick<Room, 'id' | 'name' | 'capacity' | 'hotelId'> & {
        createdAt: string;
        updatedAt: string;
      };
      const hotelForm: HotelCompare & { Rooms: RoomCompare[] } = {
        id: hotel.id,
        image: hotel.image,
        name: hotel.name,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            ...room1,
            createdAt: room1.createdAt.toISOString(),
            updatedAt: room1.updatedAt.toISOString(),
          },
        ],
      };

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(hotelForm);
    });
  });
});
