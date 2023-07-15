import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { createUser } from '../factories';
import { cleanDb, generateFullTicketPayment, generateHotel, generateRoom, generateValidToken } from '../helpers';
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

    it('should respond with status 404 when enrollment does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when no hotel is found', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.RESERVED);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is for remote', async () => {
      const isRemote = true;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const isRemote = false;
      const includesHotel = false;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and hotels data', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

      const hotel1 = await generateHotel();
      const hotel2 = await generateHotel();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([hotel1, hotel2]);
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
    it('should respond with status 400 when receiving hotel id as not a number', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/randomString').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when receiving non valid hotel id number', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/-1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when user does not have a ticket', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when enrollment does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when hotel does not exist', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

      const response = await server.get('/hotels/99999999').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.RESERVED);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is for remote', async () => {
      const isRemote = true;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const isRemote = false;
      const includesHotel = false;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and hotel rooms', async () => {
      const isRemote = false;
      const includesHotel = true;
      const token = await generateFullTicketPayment(isRemote, includesHotel, TicketStatus.PAID);

      const hotel = await generateHotel();
      const room = await generateRoom(hotel.id);
      const hotelForm = { ...hotel, Rooms: [room] };

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(hotelForm);
    });
  });
});
