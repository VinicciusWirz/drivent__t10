import Joi from 'joi';
import { BookingBody } from '@/controllers';

export const bookingSchema = Joi.object<BookingBody>({
  roomId: Joi.number().integer().required(),
});
