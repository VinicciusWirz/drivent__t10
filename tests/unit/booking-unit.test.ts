import { Booking, Room } from '@prisma/client';
import { generateBooking, buildFullTicket } from '../factories';
import bookingService from '@/services/booking-service';
import bookingsRepository from '@/repositories/bookings-repository';
import ticketRepository from '@/repositories/ticket-repository';
import roomsRepository from '@/repositories/rooms-repository';
import { forbiddenError, notFoundError } from '@/errors';

describe('Booking Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBooking service', () => {
    it('should return booking info', async () => {
      const bookingModel = generateBooking();
      jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);

      const booking = await bookingService.getBooking(1);
      expect(booking).toEqual(bookingModel);
    });

    it('should return NotFoundError if user does not have booking', () => {
      jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);

      const promise = bookingService.getBooking(1);
      expect(promise).rejects.toEqual(notFoundError());
    });
  });

  describe('makeBooking service', () => {
    it('should return bookingId', async () => {
      const ticket = buildFullTicket('PAID', false, true);
      const bookingModel = generateBooking(ticket.Enrollment.userId);
      const room: Room & { Booking: Booking[] } = {
        ...bookingModel.Room,
        Booking: [
          {
            ...bookingModel,
          },
        ],
      };
      jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
      jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);
      jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(room);
      jest.spyOn(bookingsRepository, 'makeBooking').mockResolvedValueOnce(bookingModel);

      const booking = await bookingService.makeBooking(1, 1);
      expect(booking).toEqual({ bookingId: bookingModel.id });
    });

    it('should return NotFoundError if room does not exist', () => {
      const ticket = buildFullTicket('PAID', false, true);

      jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
      jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(null);

      const promise = bookingService.makeBooking(1, 1);
      expect(promise).rejects.toEqual(notFoundError());
    });

    describe('should return ForbiddenError', () => {
      it('if ticket is not paid', () => {
        const ticket = buildFullTicket('RESERVED', false, true);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.makeBooking(1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if ticket is remote', () => {
        const ticket = buildFullTicket('PAID', true, false);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.makeBooking(1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if ticket does not include hotel', () => {
        const ticket = buildFullTicket('PAID', false, false);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.makeBooking(1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if user is already booked', () => {
        const ticket = buildFullTicket('PAID', false, true);
        const bookingModel = generateBooking(ticket.Enrollment.userId);
        const room: Room & { Booking: Booking[] } = {
          ...bookingModel.Room,
          Booking: [
            {
              ...bookingModel,
            },
          ],
        };
        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
        jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);
        jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(room);

        const promise = bookingService.makeBooking(1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if room is full', () => {
        const ticket = buildFullTicket('PAID', false, true);
        const bookingModel = generateBooking(ticket.Enrollment.userId, 1);
        const room: Room & { Booking: Booking[] } = {
          ...bookingModel.Room,
          Booking: [
            {
              ...bookingModel,
            },
          ],
        };
        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
        jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);
        jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(room);

        const promise = bookingService.makeBooking(1, 1);
        expect(promise).rejects.toEqual(forbiddenError('The room is fully booked and currently unavailable.'));
      });
    });
  });

  describe('modify service', () => {
    it('should return bookingId', async () => {
      const ticket = buildFullTicket('PAID', false, true);
      const bookingModel = generateBooking(ticket.Enrollment.userId);
      const room: Room & { Booking: Booking[] } = {
        ...bookingModel.Room,
        Booking: [
          {
            ...bookingModel,
          },
        ],
      };
      jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
      jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);
      jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(room);
      jest.spyOn(bookingsRepository, 'modifyBooking').mockResolvedValueOnce(bookingModel);

      const booking = await bookingService.modifyBooking(1, 1, bookingModel.id);
      expect(booking).toEqual({ bookingId: bookingModel.id });
    });

    it('should return NotFoundError if room does not exist', () => {
      const ticket = buildFullTicket('PAID', false, true);
      const bookingModel = generateBooking(ticket.Enrollment.userId);

      jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
      jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);
      jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(null);

      const promise = bookingService.modifyBooking(1, 1, bookingModel.id);
      expect(promise).rejects.toEqual(notFoundError());
    });

    describe('should return ForbiddenError', () => {
      it('if ticket is not paid', () => {
        const ticket = buildFullTicket('RESERVED', false, true);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.modifyBooking(1, 1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if ticket is remote', () => {
        const ticket = buildFullTicket('PAID', true, false);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.modifyBooking(1, 1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if ticket does not include hotel', () => {
        const ticket = buildFullTicket('PAID', false, false);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);

        const promise = bookingService.modifyBooking(1, 1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if user is not booked', () => {
        const ticket = buildFullTicket('PAID', false, true);

        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
        jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);

        const promise = bookingService.modifyBooking(1, 1, 1);
        expect(promise).rejects.toEqual(forbiddenError());
      });

      it('if room is full', () => {
        const ticket = buildFullTicket('PAID', false, true);
        const bookingModel = generateBooking(ticket.Enrollment.userId, 1);
        const room: Room & { Booking: Booking[] } = {
          ...bookingModel.Room,
          Booking: [
            {
              ...bookingModel,
            },
          ],
        };
        jest.spyOn(ticketRepository, 'findUserTicketByUserId').mockResolvedValueOnce(ticket);
        jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(bookingModel);
        jest.spyOn(roomsRepository, 'findRoomById').mockResolvedValueOnce(room);

        const promise = bookingService.modifyBooking(1, 1, bookingModel.id);
        expect(promise).rejects.toEqual(forbiddenError('The room is fully booked and currently unavailable.'));
      });
    });
  });
});
