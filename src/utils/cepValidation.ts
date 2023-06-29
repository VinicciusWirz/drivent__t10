import { request } from './request';
import { notFoundError } from '@/errors';
import { ViaCEPAddress } from '@/protocols';

export async function cepValidation(cep: string): Promise<ViaCEPAddress> {
  const { data } = await request.get<ViaCEPAddress>(`${process.env.VIA_CEP_API}/${cep}/json/`);

  const notValidCEP = !data;
  const notFoundCEP: boolean = (data as { erro: boolean })?.erro;
  if (notValidCEP || notFoundCEP) throw notFoundError();
  return data as ViaCEPAddress;
}
