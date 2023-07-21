import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { createUser } from '../factories';
import { cleanDb, generateFullTicketPayment, generateHotel, generateRoom, generateValidToken } from '../helpers';
import { buildBooking } from '../factories/bookings-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/booking');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 200 with booking information', async () => {
      const isRemote = false;
      const includesHotel = true;
      const { token, user } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const hotel = await generateHotel();
      const createdRoom = await generateRoom(hotel.id);
      const booking = await buildBooking(user.id, createdRoom.id);
      const { createdAt, updatedAt, id, roomId, userId } = booking;

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id,
        roomId,
        userId,
        Room: createdRoom,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      });
    });

    describe('shoudl respond with status 404', () => {
      it('when user is not booked', async () => {
        const token = await generateValidToken();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    });
  });
});

describe('POST /booking', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.post('/booking');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 200 and booking id', async () => {
      const isRemote = false;
      const includesHotel = true;
      const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const hotel = await generateHotel();
      const room = await generateRoom(hotel.id);
      const validBody = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });

    describe('should respond with 404', () => {
      it('when room id does not exist', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const validBody = { roomId: 1 };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    });

    describe('should respond with 403', () => {
      it('when user has not paid the ticket', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.RESERVED);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when ticket type is remote', async () => {
        const isRemote = true;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when user has not paid the ticket', async () => {
        const isRemote = false;
        const includesHotel = false;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when room is fulled booked', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { user } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id, 1);
        await buildBooking(user.id, room.id);

        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

        const validBody = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when user is already booked', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { user, token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const room2 = await generateRoom(hotel.id);
        await buildBooking(user.id, room.id);

        const validBody = { roomId: room2.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.put('/booking');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 200 and booking id', async () => {
      const isRemote = false;
      const includesHotel = true;
      const { token, user } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const hotel = await generateHotel();
      const room = await generateRoom(hotel.id);
      const room2 = await generateRoom(hotel.id);
      const booking = await buildBooking(user.id, room.id);

      const validBody = { roomId: room2.id };
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });

    describe('should respond with 403', () => {
      it('when user has not paid the ticket', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.RESERVED);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when ticket type is remote', async () => {
        const isRemote = true;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when user has not paid the ticket', async () => {
        const isRemote = false;
        const includesHotel = false;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);
        const validBody = { roomId: room.id };
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when room is fulled booked', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { user } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id, 1);
        await buildBooking(user.id, room.id);

        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

        const validBody = { roomId: room.id };
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('when user is not booked', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id);

        const validBody = { roomId: room.id };
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
    });

    describe('should respond with 404', () => {
      it('when room id does not exist', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token, user } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
        const hotel = await generateHotel();
        const room = await generateRoom(hotel.id, 1);
        const booking = await buildBooking(user.id, room.id);
        const validBody = { roomId: room.id + 1 };
        const response = await server
          .put(`/booking/${booking.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(validBody);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    });

    describe('should respond with 400', () => {
      it('when room id does not a valid id', async () => {
        const isRemote = false;
        const includesHotel = true;
        const { token } = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

        const validBody = { roomId: 1 };
        const response = await server.put('/booking/batata').set('Authorization', `Bearer ${token}`).send(validBody);
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });
    });
  });
});
