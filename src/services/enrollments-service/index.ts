import { Address, Enrollment } from '@prisma/client';
import { AxiosResponse } from 'axios';
import { request } from '@/utils/request';
import { invalidDataError, notFoundError } from '@/errors';
import addressRepository, { CreateAddressParams } from '@/repositories/address-repository';
import enrollmentRepository, { CreateEnrollmentParams } from '@/repositories/enrollment-repository';
import { exclude } from '@/utils/prisma-utils';
import { RequestError, ViaCEPAddress } from '@/protocols';

// TODO - Receber o CEP por parâmetro nesta função.
type AddressResponse = Omit<ViaCEPAddress, 'localidade'> & { cidade: string };
type AxiosType<T> = AxiosResponse<T> | RequestError;
async function getAddressFromCEP(cep: string): Promise<AddressResponse> {
  // FIXME: está com CEP fixo!
  const { data }: AxiosType<{ data: ViaCEPAddress | { erro: boolean } }> = await request.get(
    `${process.env.VIA_CEP_API}/${cep}/json/`,
  );

  const notValidCEP = !data;
  const notFoundCEP: boolean = (data as { erro: boolean })?.erro;
  if (notValidCEP || notFoundCEP) {
    throw notFoundError();
  }

  // FIXME: não estamos interessados em todos os campos
  const cepAddress = data as ViaCEPAddress;
  const address = {
    logradouro: cepAddress.logradouro,
    complemento: cepAddress.complemento,
    bairro: cepAddress.bairro,
    cidade: cepAddress.localidade,
    uf: cepAddress.uf,
  };

  return address;
}

async function getOneWithAddressByUserId(userId: number): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) throw notFoundError();

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...exclude(enrollmentWithAddress, 'userId', 'createdAt', 'updatedAt', 'Address'),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<Enrollment, 'userId' | 'createdAt' | 'updatedAt'>;

function getFirstAddress(firstAddress: Address): GetAddressResult {
  if (!firstAddress) return null;

  return exclude(firstAddress, 'createdAt', 'updatedAt', 'enrollmentId');
}

type GetAddressResult = Omit<Address, 'createdAt' | 'updatedAt' | 'enrollmentId'>;

async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
  const enrollment = exclude(params, 'address');
  const address = getAddressForUpsert(params.address);

  // TODO - Verificar se o CEP é válido antes de associar ao enrollment.

  const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, 'userId'));

  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};

export default enrollmentsService;
