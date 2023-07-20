import Joi from 'joi';
import { BookingParams } from '@/controllers';

export const bookingSchema = Joi.object<BookingParams>({
  roomId: Joi.number().required(),
});
