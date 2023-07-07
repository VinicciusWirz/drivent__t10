import Joi from 'joi';
import { PaymentInfo } from '@/protocols';

export const paymentServiceSchema = Joi.object<PaymentInfo>({
  ticketId: Joi.number().required(),
  cardData: Joi.object({
    issuer: Joi.string().required(),
    number: Joi.number().required(),
    name: Joi.string().required(),
    cvv: Joi.number().required(),
    expirationDate: Joi.string().required(),
  }).required(),
});
